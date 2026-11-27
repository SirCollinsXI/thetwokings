const berlinDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

function isPreviewHost(host) {
  return /^[a-z0-9-]+\.wuesten-bogen-app\.pages\.dev$/.test(host)
    || ["localhost", "127.0.0.1", "[::1]"].includes(host);
}

function isSpeculative(headers) {
  return ["sec-purpose", "purpose", "x-purpose"].some(name =>
    /\b(prefetch|prerender|preview)\b/i.test(headers.get(name) || "")
  );
}

export async function onRequestGet({ request, env, next }) {
  const url = new URL(request.url);
  const db = env.PREVIEW_HOMEPAGE_STATS;
  if (!db || url.pathname !== "/homepage-preview" || !isPreviewHost(url.hostname)) {
    return next();
  }

  // A cached validator for the static file does not describe the live counter.
  const headers = new Headers(request.headers);
  headers.delete("if-none-match");
  headers.delete("if-modified-since");
  const asset = await next(new Request(request, { headers }));
  if (asset.status !== 200 || !/^text\/html(?:\s*;|$)/i.test(asset.headers.get("content-type") || "")) {
    return asset;
  }

  const page = new Response(asset.body, asset);
  page.headers.set("Cache-Control", "no-store");
  for (const name of ["ETag", "Last-Modified", "Content-Length", "CDN-Cache-Control", "Cloudflare-CDN-Cache-Control"]) {
    page.headers.delete(name);
  }
  if (isSpeculative(request.headers)) return page;

  const day = berlinDate.format(new Date());
  try {
    const increment = db.prepare(`
      INSERT INTO preview_homepage_views (day, views) VALUES (?, 1)
      ON CONFLICT(day) DO UPDATE SET views = views + 1
    `).bind(day);
    const summary = db.prepare(`
      SELECT views, (SELECT MIN(day) FROM preview_homepage_views) AS started
      FROM preview_homepage_views WHERE day = ?
    `).bind(day);
    const [, result] = await db.batch([increment, summary]);
    const { views, started } = result.results[0];
    return new HTMLRewriter().on("#stats-panel", {
      element(panel) {
        panel.setAttribute("data-views", String(views));
        panel.setAttribute("data-start", started);
        panel.setAttribute("data-day", day);
      }
    }).transform(page);
  } catch {
    console.warn("Preview homepage statistics are unavailable.");
    return page;
  }
}
