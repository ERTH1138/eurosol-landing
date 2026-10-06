// Jelszavas védelem (HTTP Basic Auth) a /rivergate aloldalra.
// A jelszó a Netlify RIVERGATE_PASSWORD környezeti változójából jön;
// ha nincs beállítva, az oldal zárva marad. A felhasználónév tetszőleges.
import type { Config, Context } from "@netlify/edge-functions";

const unauthorized = () =>
  new Response("Jelszó szükséges / Password required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Rivergate", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });

const safeEqual = (a: string, b: string) => {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  }
  return diff === 0;
};

export default async (req: Request, context: Context) => {
  const expected = Netlify.env.get("RIVERGATE_PASSWORD");
  if (!expected) return unauthorized();

  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return unauthorized();

  let password = "";
  try {
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0)),
    );
    password = decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return unauthorized();
  }
  if (!safeEqual(password, expected)) return unauthorized();

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
