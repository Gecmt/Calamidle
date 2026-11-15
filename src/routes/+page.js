import weapons from "#lib/data/weapons.json";
import bosses from "#lib/data/bosses.json";

// Put your Cloudflare Worker address here (no trailing slash).
const WORKER_URL = "https://calamidle-answers.gecmt.workers.dev";

const CACHE_KEY = "dailyAnswer";

async function getAnswer() {
    // Already fetched today? Reuse it until the day ends: zero requests.
    try {
        const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (saved && Date.now() < saved.expires) return saved;
    } catch {}

    const res = await fetch(WORKER_URL);
    if (!res.ok) throw new Error("Could not load today's answer (" + res.status + ")");
    const answer = await res.json();

    try { localStorage.setItem(CACHE_KEY, JSON.stringify(answer)); } catch {}
    return answer;
}

export async function load() {
    const { day, weaponNum, bossNum } = await getAnswer();

    return {
        weaponIndex: weaponNum % Object.keys(weapons).length,
        bossIndex: bossNum % bosses.length,
        weapons: weapons,
        day: day
    };
}
