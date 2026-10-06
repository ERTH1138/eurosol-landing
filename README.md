# eurosol.hu – nyitóoldal

Kétirányú nyitóoldal a www.eurosol.hu címre:

- **Euro-Solutions** (műanyag-kereskedelem) → https://plastic-eurosol.netlify.app
- **Eurosol Racing Team** (rally) → https://eurosol-racing-team-hungary.netlify.app

Logók és háttérkép: `assets/` (márkaszínek: #181a33, #172f50, #1c58aa, #43b2e9, #fff200, #ffbd00).

Statikus HTML/CSS/JS, build nélkül. HU/EN/DE/PL nyelvváltó (`script.js`).
A célcímeket az `index.html` két `href`-je adja meg.

## Képek
- Rally háttér: saját fotó (hatter.jpg)
- Euro-Solutions háttér: Pixabay, Pexels – https://www.pexels.com/photo/assorted-color-illustration-531765/ (Pexels License, ingyenes kereskedelmi használat)

## Netlify
Publish directory: `.` (a `netlify.toml` beállítja). Build command: nincs.

## Jelszóval védett aloldalak

| Aloldal | Mappa | Jelszó (Netlify env) |
|---|---|---|
| https://www.eurosol.hu/rivergate | `rivergate/` | `RIVERGATE_PASSWORD` |
| https://www.eurosol.hu/ese | `ese/` (Euro Solar Energy, EN/DE) | `ESE_PASSWORD` |

### Rivergate
`rivergate/` → https://www.eurosol.hu/rivergate

A védelmet a `netlify/edge-functions/password-protect.ts` edge function adja (új aloldal: `AREAS` lista + `config.path`): saját belépőoldal, csak jelszóval;
sikeres belépés után 30 napig érvényes süti. A jelszó a Netlify `RIVERGATE_PASSWORD` környezeti változójában van
(Project configuration → Environment variables). Ha a változó nincs beállítva, az oldal zárva marad.
Jelszócsere után új deploy kell (Deploys → Trigger deploy).
