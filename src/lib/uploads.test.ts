import { describe, expect, it } from "vitest";

import {
  getDeleteAfter,
  MAX_UPLOAD_BYTES,
  PHOTO_RETENTION_DAYS,
  validateImageUpload,
} from "./uploads";

describe("validateImageUpload", () => {
  it("accepts Gemini-supported image files with readable metadata", async () => {
    const jpeg = new File([minimalJpeg()], "selfie.jpg", {
      type: "image/jpeg",
    });
    const png = new File([minimalPng()], "selfie.png", { type: "image/png" });
    const webp = new File([minimalWebp(640, 960)], "selfie.webp", {
      type: "image/webp",
    });
    const heic = new File([minimalHeif(3024, 4032)], "selfie.heic", {
      type: "image/heic",
    });

    await expect(validateImageUpload(jpeg)).resolves.toMatchObject({
      extension: "jpg",
      width: 256,
      height: 256,
      orientation: 1,
    });
    await expect(validateImageUpload(png)).resolves.toMatchObject({
      extension: "png",
      width: 256,
      height: 256,
      orientation: 1,
    });
    await expect(validateImageUpload(webp)).resolves.toMatchObject({
      extension: "webp",
      width: 640,
      height: 960,
      orientation: 1,
    });
    await expect(validateImageUpload(heic)).resolves.toMatchObject({
      extension: "heic",
      width: 3024,
      height: 4032,
      orientation: 1,
    });
  });

  it("reads JPEG EXIF orientation", async () => {
    const jpeg = new File([minimalJpeg(512, 768, 6)], "portrait.jpg", {
      type: "image/jpeg",
    });

    await expect(validateImageUpload(jpeg)).resolves.toMatchObject({
      width: 512,
      height: 768,
      orientation: 6,
    });
  });

  it("rejects invalid content and oversized files", async () => {
    const fakeJpeg = new File([new Uint8Array([1, 2, 3])], "fake.jpg", {
      type: "image/jpeg",
    });
    const oversized = { type: "image/png", size: MAX_UPLOAD_BYTES + 1 } as File;

    await expect(validateImageUpload(fakeJpeg)).rejects.toThrow(
      "INVALID_IMAGE_SIGNATURE",
    );
    await expect(validateImageUpload(oversized)).rejects.toThrow(
      "INVALID_IMAGE_SIZE",
    );
  });

  it("does not reject readable images only because they are small or wide", async () => {
    const small = new File([minimalPng(128, 128)], "small.png", {
      type: "image/png",
    });
    const wide = new File([minimalJpeg(4096, 512)], "wide.jpg", {
      type: "image/jpeg",
    });

    await expect(validateImageUpload(small)).resolves.toMatchObject({
      width: 128,
      height: 128,
    });
    await expect(validateImageUpload(wide)).resolves.toMatchObject({
      width: 4096,
      height: 512,
    });
  });
});

describe("getDeleteAfter", () => {
  it("returns the 30-day retention deadline", () => {
    const now = new Date("2026-06-07T00:00:00.000Z");
    expect(getDeleteAfter(now)).toBe("2026-07-07T00:00:00.000Z");
    expect(PHOTO_RETENTION_DAYS).toBe(30);
  });
});

function minimalJpeg(width = 256, height = 256, orientation = 1): ArrayBuffer {
  const exif =
    orientation === 1
      ? []
      : [
          0xff,
          0xe1,
          0x00,
          0x22,
          0x45,
          0x78,
          0x69,
          0x66,
          0x00,
          0x00,
          0x49,
          0x49,
          0x2a,
          0x00,
          0x08,
          0x00,
          0x00,
          0x00,
          0x01,
          0x00,
          0x12,
          0x01,
          0x03,
          0x00,
          0x01,
          0x00,
          0x00,
          0x00,
          orientation,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
          0x00,
        ];
  return Uint8Array.from([
    0xff,
    0xd8,
    ...exif,
    0xff,
    0xc0,
    0x00,
    0x11,
    0x08,
    height >> 8,
    height & 0xff,
    width >> 8,
    width & 0xff,
    0x03,
    0x01,
    0x11,
    0x00,
    0x02,
    0x11,
    0x00,
    0x03,
    0x11,
    0x00,
    0xff,
    0xd9,
  ]).buffer;
}

function minimalPng(width = 256, height = 256): ArrayBuffer {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes.buffer;
}

function minimalWebp(width = 256, height = 256): ArrayBuffer {
  const bytes = new Uint8Array(30);
  bytes.set(ascii("RIFF"), 0);
  writeUint32LE(bytes, 4, bytes.length - 8);
  bytes.set(ascii("WEBP"), 8);
  bytes.set(ascii("VP8X"), 12);
  writeUint32LE(bytes, 16, 10);
  writeUint24LE(bytes, 24, width - 1);
  writeUint24LE(bytes, 27, height - 1);
  return bytes.buffer;
}

function minimalHeif(width = 256, height = 256): ArrayBuffer {
  const bytes = new Uint8Array(72);
  writeBox(bytes, 0, 24, "ftyp");
  bytes.set(ascii("heic"), 8);
  writeUint32BE(bytes, 12, 0);
  bytes.set(ascii("heic"), 16);
  bytes.set(ascii("mif1"), 20);

  writeBox(bytes, 24, 48, "meta");
  writeUint32BE(bytes, 32, 0);
  writeBox(bytes, 36, 36, "iprp");
  writeBox(bytes, 44, 28, "ipco");
  writeBox(bytes, 52, 20, "ispe");
  writeUint32BE(bytes, 60, 0);
  writeUint32BE(bytes, 64, width);
  writeUint32BE(bytes, 68, height);
  return bytes.buffer;
}

function writeBox(
  bytes: Uint8Array,
  offset: number,
  size: number,
  type: string,
) {
  writeUint32BE(bytes, offset, size);
  bytes.set(ascii(type), offset + 4);
}

function writeUint24LE(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
  bytes[offset + 2] = (value >> 16) & 0xff;
}

function writeUint32LE(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >> 8) & 0xff;
  bytes[offset + 2] = (value >> 16) & 0xff;
  bytes[offset + 3] = (value >> 24) & 0xff;
}

function writeUint32BE(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = (value >> 24) & 0xff;
  bytes[offset + 1] = (value >> 16) & 0xff;
  bytes[offset + 2] = (value >> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

function ascii(value: string): Uint8Array {
  return Uint8Array.from([...value].map((char) => char.charCodeAt(0)));
}
