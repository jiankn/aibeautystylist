export type ResultImageVariant = "display";

interface StoredImageObjectLike {
  body: ReadableStream | ArrayBuffer;
  httpMetadata?: { contentType?: string };
}

interface ResultImageResponseOptions {
  object: StoredImageObjectLike;
  images?: ImagesBinding;
  variant?: ResultImageVariant;
  variantsEnabled: boolean;
  fallbackContentType: string;
  originalCacheControl: string;
  variantCacheControl: string;
  context: string;
}

const DISPLAY_WIDTH = 1024;
const DISPLAY_QUALITY = 82;

export function resultDisplayImageUrl(imageUrl: string | undefined) {
  if (!imageUrl) return undefined;
  if (!imageUrl.startsWith("/api/")) return imageUrl;
  return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}variant=display`;
}

export function normalizeResultImageVariant(
  value: string | null | undefined,
): ResultImageVariant | undefined {
  return value === "display" ? value : undefined;
}

export function isImageVariantsEnabled(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(
    String(value ?? "")
      .trim()
      .toLowerCase(),
  );
}

export async function createResultImageResponse({
  object,
  images,
  variant,
  variantsEnabled,
  fallbackContentType,
  originalCacheControl,
  variantCacheControl,
  context,
}: ResultImageResponseOptions): Promise<Response> {
  const sourceContentType =
    object.httpMetadata?.contentType ?? fallbackContentType;

  if (
    variant === "display" &&
    variantsEnabled &&
    images &&
    canTransformImage(sourceContentType)
  ) {
    const bytes = await bodyToArrayBuffer(object.body);
    try {
      const transformed = await images
        .input(new Response(bytes).body as ReadableStream<Uint8Array>)
        .transform({ width: DISPLAY_WIDTH, fit: "scale-down" })
        .output({ format: "image/webp", quality: DISPLAY_QUALITY });
      const response = transformed.response();
      return new Response(response.body, {
        headers: imageHeaders({
          cacheControl: variantCacheControl,
          contentType: transformed.contentType() || "image/webp",
          delivery: "cf-images-display",
        }),
      });
    } catch (error) {
      console.warn("CF_IMAGE_VARIANT_FAILED", {
        context,
        message: error instanceof Error ? error.message : String(error),
      });
      return createOriginalResponse(
        bytes,
        sourceContentType,
        originalCacheControl,
      );
    }
  }

  return createOriginalResponse(
    object.body as BodyInit,
    sourceContentType,
    originalCacheControl,
  );
}

function createOriginalResponse(
  body: BodyInit,
  contentType: string,
  cacheControl: string,
): Response {
  return new Response(body, {
    headers: imageHeaders({
      cacheControl,
      contentType,
      delivery: "original",
    }),
  });
}

function imageHeaders({
  cacheControl,
  contentType,
  delivery,
}: {
  cacheControl: string;
  contentType: string;
  delivery: string;
}): HeadersInit {
  return {
    "cache-control": cacheControl,
    "content-type": contentType,
    "x-content-type-options": "nosniff",
    "x-image-delivery": delivery,
  };
}

function canTransformImage(contentType: string): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(contentType);
}

async function bodyToArrayBuffer(
  body: ReadableStream | ArrayBuffer,
): Promise<ArrayBuffer> {
  if (body instanceof ArrayBuffer) return body;
  return new Response(body as BodyInit).arrayBuffer();
}
