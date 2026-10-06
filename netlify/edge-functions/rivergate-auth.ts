// Jelszavas védelem a /rivergate aloldalra: saját belépőoldal, csak jelszómezővel.
// A jelszó a Netlify RIVERGATE_PASSWORD környezeti változójából jön;
// ha nincs beállítva, az oldal zárva marad. Sikeres belépés után egy
// 30 napig érvényes süti engedi tovább a látogatót (jelszócserekor érvénytelenné válik).
import type { Config, Context } from "@netlify/edge-functions";

const COOKIE = "rivergate_auth";
const MAX_AGE = 60 * 60 * 24 * 30;

const token = async (password: string) => {
  const data = new TextEncoder().encode(`rivergate:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const safeEqual = (a: string, b: string) => {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
};

const loginPage = (error: boolean) =>
  new Response(
    `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Rivergate Baja – Belépés</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
*{box-sizing:border-box;margin:0}
body{min-height:100vh;display:grid;place-items:center;padding:16px;background:#0d2630;color:#fff;font:400 16px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
form{width:100%;max-width:360px;display:grid;gap:14px;text-align:center}
.tag{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d9c39a}
h1{font:500 40px/1.1 "Cormorant Garamond",Georgia,serif;margin-bottom:8px}
input,button{font:inherit;padding:13px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.35)}
input{background:rgba(255,255,255,.06);color:#fff;text-align:center}
input:focus{outline:2px solid #b8955a;outline-offset:2px}
button{background:#b8955a;border-color:#b8955a;color:#0d2630;font-weight:600;cursor:pointer}
.err{color:#f2b8a8;font-size:14px}
</style>
</head>
<body>
<form method="post">
<div class="tag">Rivergate Baja</div>
<h1>Belépés</h1>
<input type="password" name="password" placeholder="Jelszó" aria-label="Jelszó" autocomplete="current-password" autofocus required>
${error ? '<div class="err">Hibás jelszó.</div>' : ""}
<button type="submit">Belépés</button>
</form>
</body>
</html>`,
    {
      status: 401,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );

export default async (req: Request, context: Context) => {
  const password = Netlify.env.get("RIVERGATE_PASSWORD");
  if (!password) return loginPage(false);
  const expected = await token(password);

  if (req.method === "POST") {
    const form = await req.formData().catch(() => null);
    const given = String(form?.get("password") ?? "");
    if (!safeEqual(await token(given), expected)) return loginPage(true);
    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL(req.url).pathname,
        "Set-Cookie": `${COOKIE}=${expected}; Path=/rivergate; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (!safeEqual(context.cookies.get(COOKIE) ?? "", expected)) return loginPage(false);

  const upstream = await context.next();
  const res = new Response(upstream.body, upstream);
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
};

export const config: Config = {
  path: ["/rivergate", "/rivergate/*"],
  // A közösségi megosztási előnézetkép maradjon nyilvános.
  excludedPath: ["/rivergate/img/og.jpg"],
};
