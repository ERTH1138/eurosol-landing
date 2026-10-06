// Jelszavas védelem az aloldalakra (/rivergate, /ese): saját belépőoldal, csak jelszómezővel.
// Minden aloldal jelszava külön Netlify környezeti változóban van (lásd AREAS);
// ha nincs beállítva, az oldal zárva marad. Sikeres belépés után egy
// 30 napig érvényes süti engedi tovább a látogatót (jelszócserekor érvénytelenné válik).
import type { Config, Context } from "@netlify/edge-functions";

type Area = {
  id: string;
  env: string;
  title: string;
  lang: string;
  label: string;
  button: string;
  error: string;
  bg: string;
  accent: string;
};

const AREAS: Area[] = [
  {
    id: "rivergate",
    env: "RIVERGATE_PASSWORD",
    title: "Rivergate Baja",
    lang: "hu",
    label: "Jelszó",
    button: "Belépés",
    error: "Hibás jelszó.",
    bg: "#0d2630",
    accent: "#b8955a",
  },
  {
    id: "ese",
    env: "ESE_PASSWORD",
    title: "Euro Solar Energy",
    lang: "en",
    label: "Password / Passwort",
    button: "Enter / Weiter",
    error: "Wrong password. / Falsches Passwort.",
    bg: "#0f1712",
    accent: "#ec6608",
  },
];

const MAX_AGE = 60 * 60 * 24 * 30;

const token = async (area: Area, password: string) => {
  const data = new TextEncoder().encode(`${area.id}:${password}`);
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

const loginPage = (area: Area, error: boolean) =>
  new Response(
    `<!doctype html>
<html lang="${area.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${area.title}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
*{box-sizing:border-box;margin:0}
body{min-height:100vh;display:grid;place-items:center;padding:16px;background:${area.bg};color:#fff;font:400 16px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
form{width:100%;max-width:360px;display:grid;gap:14px;text-align:center}
.tag{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:${area.accent}}
h1{font:500 40px/1.1 "Cormorant Garamond",Georgia,serif;margin-bottom:8px}
input,button{font:inherit;padding:13px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.35)}
input{background:rgba(255,255,255,.06);color:#fff;text-align:center}
input:focus{outline:2px solid ${area.accent};outline-offset:2px}
button{background:${area.accent};border-color:${area.accent};color:#fff;font-weight:600;cursor:pointer}
.err{color:#f2b8a8;font-size:14px}
</style>
</head>
<body>
<form method="post">
<div class="tag">${area.title}</div>
<h1>${area.button.split(" / ")[0]}</h1>
<input type="password" name="password" placeholder="${area.label}" aria-label="${area.label}" autocomplete="current-password" autofocus required>
${error ? `<div class="err">${area.error}</div>` : ""}
<button type="submit">${area.button}</button>
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
  const segment = new URL(req.url).pathname.split("/")[1];
  const area = AREAS.find((a) => a.id === segment);
  if (!area) return context.next();
  const cookie = `${area.id}_auth`;

  const password = Netlify.env.get(area.env);
  if (!password) return loginPage(area, false);
  const expected = await token(area, password);

  if (req.method === "POST") {
    const form = await req.formData().catch(() => null);
    const given = String(form?.get("password") ?? "");
    if (!safeEqual(await token(area, given), expected)) return loginPage(area, true);
    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL(req.url).pathname,
        "Set-Cookie": `${cookie}=${expected}; Path=/${area.id}; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (!safeEqual(context.cookies.get(cookie) ?? "", expected)) return loginPage(area, false);

  const upstream = await context.next();
  const res = new Response(upstream.body, upstream);
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
};

export const config: Config = {
  path: ["/rivergate", "/rivergate/*", "/ese", "/ese/*"],
  // A közösségi megosztási előnézetképek maradjanak nyilvánosak.
  excludedPath: ["/rivergate/img/og.jpg", "/ese/img/og.jpg"],
};
