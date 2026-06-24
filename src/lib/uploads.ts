type SupportedImageMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/heic"
  | "image/heif";

interface ImageSignature {
  offset?: number;
  bytes: number[];
}

const ALLOWED_TYPES = new Map<
  string,
  { extension: string; signatures: ImageSignature[] }
>([
  [
    "image/jpeg",
    { extension: "jpg", signatures: [{ bytes: [0xff, 0xd8, 0xff] }] },
  ],
  [
    "image/png",
    {
      extension: "png",
      signatures: [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
    },
  ],
  [
    "image/webp",
    {
      extension: "webp",
      signatures: [
        { bytes: [0x52, 0x49, 0x46, 0x46] },
        { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
      ],
    },
  ],
  [
    "image/heic",
    {
      extension: "heic",
      signatures: [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }],
    },
  ],
  [
    "image/heif",
    {
      extension: "heif",
      signatures: [{ offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }],
    },
  ],
]);

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const PHOTO_RETENTION_DAYS = 30;
export const PHOTO_CONSENT_VERSION = "2026-06-07";
export const SUPPORTED_UPLOAD_FORMAT_LABEL = "JPG、PNG、WebP、HEIC/HEIF";

export interface ValidatedImage {
  bytes: ArrayBuffer;
  contentType: SupportedImageMimeType;
  extension: "jpg" | "png" | "webp" | "heic" | "heif";
  width: number;
  height: number;
  orientation: number;
}

export async function validateImageUpload(file: File): Promise<ValidatedImage> {
  const rule = ALLOWED_TYPES.get(file.type);
  if (!rule) throw new Error("INVALID_IMAGE_TYPE");
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES)
    throw new Error("INVALID_IMAGE_SIZE");

  const bytes = await file.arrayBuffer();
  const byteView = new Uint8Array(bytes);
  const hasValidSignature = rule.signatures.every((signature) =>
    signature.bytes.every(
      (byte, index) => byteView[(signature.offset ?? 0) + index] === byte,
    ),
  );
  if (!hasValidSignature) throw new Error("INVALID_IMAGE_SIGNATURE");

  const metadata = readImageMetadata(file.type, byteView);
  const shortestSide = Math.min(metadata.width, metadata.height);
  const longestSide = Math.max(metadata.width, metadata.height);
  const aspectRatio = longestSide / shortestSide;
  if (shortestSide <= 0 || longestSide <= 0 || !Number.isFinite(aspectRatio)) {
    throw new Error("INVALID_IMAGE_DIMENSIONS");
  }

  return {
    bytes,
    contentType: file.type as ValidatedImage["contentType"],
    extension: rule.extension as ValidatedImage["extension"],
    ...metadata,
  };
}

export function getDeleteAfter(now = new Date()): string {
  const deleteAfter = new Date(now);
  deleteAfter.setUTCDate(deleteAfter.getUTCDate() + PHOTO_RETENTION_DAYS);
  return deleteAfter.toISOString();
}

function readImageMetadata(
  mimeType: string,
  bytes: Uint8Array,
): Pick<ValidatedImage, "width" | "height" | "orientation"> {
  if (mimeType === "image/png") return readPngMetadata(bytes);
  if (mimeType === "image/webp") return readWebpMetadata(bytes);
  if (mimeType === "image/heic" || mimeType === "image/heif")
    return readHeifMetadata(bytes);
  return readJpegMetadata(bytes);
}

function readPngMetadata(
  bytes: Uint8Array,
): Pick<ValidatedImage, "width" | "height" | "orientation"> {
  if (bytes.length < 24) throw new Error("INVALID_IMAGE_METADATA");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
    orientation: 1,
  };
}

function readJpegMetadata(
  bytes: Uint8Array,
): Pick<ValidatedImage, "width" | "height" | "orientation"> {
  let offset = 2;
  let width = 0;
  let height = 0;
  let orientation = 1;

  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;

    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break;

    if (marker === 0xe1)
      orientation = readExifOrientation(bytes, offset + 2, segmentLength - 2);
    if (isStartOfFrame(marker) && segmentLength >= 7) {
      height = (bytes[offset + 3] << 8) | bytes[offset + 4];
      width = (bytes[offset + 5] << 8) | bytes[offset + 6];
    }

    offset += segmentLength;
  }

  if (!width || !height) throw new Error("INVALID_IMAGE_METADATA");
  return { width, height, orientation };
}

function readWebpMetadata(
  bytes: Uint8Array,
): Pick<ValidatedImage, "width" | "height" | "orientation"> {
  if (
    bytes.length < 30 ||
    ascii(bytes, 0, 4) !== "RIFF" ||
    ascii(bytes, 8, 4) !== "WEBP"
  ) {
    throw new Error("INVALID_IMAGE_METADATA");
  }

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkType = ascii(bytes, offset, 4);
    const chunkSize = readUint32LE(bytes, offset + 4);
    const dataOffset = offset + 8;
    if (dataOffset + chunkSize > bytes.length) break;

    if (chunkType === "VP8X" && chunkSize >= 10) {
      return {
        width: readUint24LE(bytes, dataOffset + 4) + 1,
        height: readUint24LE(bytes, dataOffset + 7) + 1,
        orientation: 1,
      };
    }

    if (chunkType === "VP8 " && chunkSize >= 10) {
      const width =
        ((bytes[dataOffset + 7] << 8) | bytes[dataOffset + 6]) & 0x3fff;
      const height =
        ((bytes[dataOffset + 9] << 8) | bytes[dataOffset + 8]) & 0x3fff;
      if (width && height) return { width, height, orientation: 1 };
    }

    if (chunkType === "VP8L" && chunkSize >= 5 && bytes[dataOffset] === 0x2f) {
      const b1 = bytes[dataOffset + 1];
      const b2 = bytes[dataOffset + 2];
      const b3 = bytes[dataOffset + 3];
      const b4 = bytes[dataOffset + 4];
      return {
        width: 1 + (((b2 & 0x3f) << 8) | b1),
        height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
        orientation: 1,
      };
    }

    offset = dataOffset + chunkSize + (chunkSize % 2);
  }

  throw new Error("INVALID_IMAGE_METADATA");
}

function readHeifMetadata(
  bytes: Uint8Array,
): Pick<ValidatedImage, "width" | "height" | "orientation"> {
  if (!hasHeifBrand(bytes)) throw new Error("INVALID_IMAGE_METADATA");

  const dimensions = findIspeDimensions(bytes, 0, bytes.length, 0);
  if (!dimensions) throw new Error("INVALID_IMAGE_METADATA");
  return { ...dimensions, orientation: 1 };
}

function isStartOfFrame(marker: number): boolean {
  return [
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
    0xcf,
  ].includes(marker);
}

function readExifOrientation(
  bytes: Uint8Array,
  start: number,
  length: number,
): number {
  if (
    length < 14 ||
    String.fromCharCode(...bytes.slice(start, start + 4)) !== "Exif"
  )
    return 1;

  const tiffStart = start + 6;
  const littleEndian =
    bytes[tiffStart] === 0x49 && bytes[tiffStart + 1] === 0x49;
  const bigEndian = bytes[tiffStart] === 0x4d && bytes[tiffStart + 1] === 0x4d;
  if (!littleEndian && !bigEndian) return 1;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
  const ifdStart = tiffStart + firstIfdOffset;
  if (ifdStart + 2 > start + length) return 1;

  const entryCount = view.getUint16(ifdStart, littleEndian);
  for (let index = 0; index < entryCount; index += 1) {
    const entry = ifdStart + 2 + index * 12;
    if (entry + 12 > start + length) break;
    if (view.getUint16(entry, littleEndian) === 0x0112) {
      const value = view.getUint16(entry + 8, littleEndian);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }

  return 1;
}

function hasHeifBrand(bytes: Uint8Array): boolean {
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== "ftyp") return false;
  const heifBrands = new Set([
    "heic",
    "heix",
    "hevc",
    "hevx",
    "heif",
    "mif1",
    "msf1",
  ]);
  for (let offset = 8; offset + 4 <= bytes.length && offset < 64; offset += 4) {
    if (heifBrands.has(ascii(bytes, offset, 4))) return true;
  }
  return false;
}

function findIspeDimensions(
  bytes: Uint8Array,
  start: number,
  end: number,
  depth: number,
): Pick<ValidatedImage, "width" | "height"> | undefined {
  if (depth > 6) return undefined;

  let offset = start;
  while (offset + 8 <= end) {
    const size32 = readUint32BE(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    let headerSize = 8;
    let boxSize = size32;
    if (size32 === 1 && offset + 16 <= end) {
      const largeSize = readUint64BE(bytes, offset + 8);
      if (largeSize > Number.MAX_SAFE_INTEGER) return undefined;
      boxSize = Number(largeSize);
      headerSize = 16;
    } else if (size32 === 0) {
      boxSize = end - offset;
    }

    const boxEnd = offset + boxSize;
    if (boxSize < headerSize || boxEnd > end) break;
    const dataStart = offset + headerSize;

    if (type === "ispe" && dataStart + 12 <= boxEnd) {
      return {
        width: readUint32BE(bytes, dataStart + 4),
        height: readUint32BE(bytes, dataStart + 8),
      };
    }

    const childStart = type === "meta" ? dataStart + 4 : dataStart;
    if (["meta", "iprp", "ipco"].includes(type) && childStart < boxEnd) {
      const dimensions = findIspeDimensions(
        bytes,
        childStart,
        boxEnd,
        depth + 1,
      );
      if (dimensions) return dimensions;
    }

    offset = boxEnd;
  }

  return undefined;
}

function readUint24LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    (((bytes[offset] << 24) >>> 0) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
}

function readUint64BE(bytes: Uint8Array, offset: number): bigint {
  let value = 0n;
  for (let index = 0; index < 8; index += 1) {
    value = (value << 8n) | BigInt(bytes[offset + index]);
  }
  return value;
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}
