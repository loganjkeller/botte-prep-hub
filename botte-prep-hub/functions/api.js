export async function onRequest(context) {
  const { request, env } = context;

  // Set these in Cloudflare Pages → Settings → Environment variables
  const baseUrl = env.APPS_SCRIPT_URL;       // your .../exec
  const token = env.APPS_SCRIPT_TOKEN;       // your api_token

  if (!baseUrl || !token) {
    return new Response(JSON.stringify({ ok:false, error:"Missing APPS_SCRIPT_URL or APPS_SCRIPT_TOKEN in Cloudflare env vars." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const body = request.method === "POST" ? await request.text() : "{}";

  const url = new URL(baseUrl);
  url.searchParams.set("api_token", token);

  const upstream = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body || "{}",
  });

  const text = await upstream.text();

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json", "Cache-Control":"no-store" }
  });
}
