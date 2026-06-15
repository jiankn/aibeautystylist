export interface PrototypePage {
  title: string;
  bodyClass: string;
  bodyHtml: string;
}

const routeMap: Record<string, string> = {
  "index.html": "/",
  "discover.html": "/discover",
  "diagnosis.html": "/diagnosis",
  "pricing.html": "/pricing",
  "share-card.html": "/share-card",
  "tryon-free.html": "/tryon-free",
  "tryon-pro.html": "/tryon-pro",
  "tryon-premium.html": "/tryon-premium",
};

export function parsePrototype(source: string): PrototypePage {
  const title =
    source.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() ?? "AI Beauty Stylist";
  const bodyMatch = source.match(
    /<body(?:\s+class="([^"]*)")?>([\s\S]*?)<\/body>/i,
  );

  if (!bodyMatch) {
    throw new Error("Prototype page is missing a body element.");
  }

  let bodyHtml = bodyMatch[2]
    .replace(/<script\s+src="app\.js"><\/script>/gi, "")
    .replace(/(href|src)="images\//g, '$1="/images/')
    .replace(/href="([^"]+\.html)"/g, (_match, target: string) => {
      return `href="${routeMap[target] ?? target}"`;
    });

  return {
    title,
    bodyClass: bodyMatch[1] ?? "",
    bodyHtml,
  };
}
