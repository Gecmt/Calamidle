// Calamidle daily-answer Worker.
// Secrets (set in the Cloudflare dashboard, NOT in this file):
//   BASENUMBER, ANUMBER, MNUMBER
// Optional variable:
//   ALLOWED_ORIGIN  e.g. https://gecmt.github.io

const DAY_MS = 86400000;

// The new day starts at midnight UTC. To start it at another time, change this number of hours
// (e.g. 3 = midnight in Turkey, -5 = midnight in New York winter time).
const UTC_OFFSET_HOURS = 0;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "";
    const okOrigin =
      origin === allowed ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1");

    const cors = {
      "Access-Control-Allow-Origin": okOrigin ? origin : allowed,
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "GET" } });
    }

    const now = Date.now();
    const offset = UTC_OFFSET_HOURS * 3600000;
    const day = Math.floor((now + offset) / DAY_MS);

    // Weapon: same math as the old server code, minus the final "% number of weapons"
    // (the game does that part itself, so this file never needs updating when you add weapons).
    const c = parseInt(env.BASENUMBER) / 1000;
    const raw = (day * parseFloat(env.ANUMBER) + c) % parseFloat(env.MNUMBER);
    const weaponNum = Math.round(raw * 100000);

    // Boss: same idea, the game applies "% number of bosses".
    const bossNum = Math.abs(Math.floor((day * 0.6180339887 + 847293.615) * 100000));

    // Let browsers/Cloudflare cache the answer until the day flips (saves requests).
    const expires = (day + 1) * DAY_MS - offset;
    const secondsLeft = Math.max(60, Math.floor((expires - now) / 1000));

    return new Response(JSON.stringify({ day, weaponNum, bossNum, expires }), {
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${secondsLeft}`,
      },
    });
  },
};
