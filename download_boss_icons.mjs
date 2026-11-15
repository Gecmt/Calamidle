import fs from "node:fs/promises";
import path from "node:path";

const sources = [
{
name: "calamity",
api: "https://calamitymod.wiki.gg/api.php",
category: "Category:NPC map icons"
},
{
name: "vanilla",
api: "https://terraria.wiki.gg/api.php",
category: "Category:NPC map icons"
}
];

const catalogPath = "static/bosses/icon_catalog.json";
const catalog = [];

async function wait(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestJSON(url) {
for (let attempt = 1; attempt <= 5; attempt++) {
try {
const response = await fetch(url, {
headers: {
"User-Agent": "CalamIdle Boss Icon Downloader/1.0"
}
});

if (!response.ok) {
throw new Error(`HTTP ${response.status}`);
}

return await response.json();
} catch (error) {
console.log(`Request failed (${attempt}/5): ${error.message}`);
if (attempt === 5) throw error;
await wait(2000 * attempt);
}
}
}

async function saveCatalog() {
await fs.writeFile(
catalogPath,
JSON.stringify(catalog, null, 2)
);
}

async function downloadImage(source, title, imageUrl) {
const filename = title.replace(/^File:/, "");
const localPath = `static/bosses/${source.name}/${filename}`;

try {
await fs.access(localPath);

console.log("Already downloaded:", filename);
catalog.push({
source: source.name,
filename,
path: `/${localPath.replace(/^static\//, "")}`
});

await saveCatalog();
return;
} catch {}

for (let attempt = 1; attempt <= 5; attempt++) {
try {
const response = await fetch(imageUrl, {
headers: {
"User-Agent": "CalamIdle Boss Icon Downloader/1.0"
}
});

if (!response.ok) {
throw new Error(`HTTP ${response.status}`);
}

const buffer = Buffer.from(await response.arrayBuffer());

if (!buffer.length) {
throw new Error("Empty image");
}

await fs.writeFile(localPath, buffer);

catalog.push({
source: source.name,
filename,
path: `/${localPath.replace(/^static\//, "")}`
});

await saveCatalog();
console.log("Downloaded:", filename);
return;
} catch (error) {
console.log(`Image failed (${attempt}/5): ${filename} - ${error.message}`);
if (attempt === 5) {
console.log("Gave up on:", filename);
return;
}
await wait(2000 * attempt);
}
}
}

async function downloadCategory(source) {
console.log(`\n=== ${source.name.toUpperCase()} ===`);

let continuation = "";
let count = 0;

while (true) {
const params = new URLSearchParams({
action: "query",
generator: "categorymembers",
gcmtitle: source.category,
gcmtype: "file",
gcmlimit: "max",
prop: "imageinfo",
iiprop: "url",
format: "json"
});

if (continuation) {
params.set("gcmcontinue", continuation);
}

let data;

try {
data = await requestJSON(`${source.api}?${params}`);
} catch (error) {
console.log(`Could not retrieve ${source.name} category: ${error.message}`);
return;
}

const pages = Object.values(data.query?.pages ?? {});

for (const page of pages) {
const imageUrl = page.imageinfo?.[0]?.url;

if (!imageUrl) {
console.log("No image URL:", page.title);
continue;
}

await downloadImage(source, page.title, imageUrl);
count++;
await wait(500);
}

console.log(`${source.name}: processed ${count} files`);

continuation = data.continue?.gcmcontinue ?? "";

if (!continuation) break;
}

console.log(`${source.name} category finished.`);
}

await fs.mkdir("static/bosses/calamity", { recursive: true });
await fs.mkdir("static/bosses/vanilla", { recursive: true });

// Recover the existing downloads if this is a resumed run.
for (const source of sources) {
const directory = `static/bosses/${source.name}`;
const files = await fs.readdir(directory);

for (const filename of files) {
if (filename.toLowerCase().endsWith(".png")) {
catalog.push({
source: source.name,
filename,
path: `/bosses/${source.name}/${filename}`
});
}
}
}

await saveCatalog();

for (const source of sources) {
await downloadCategory(source);
}

console.log(`\nFinished. Catalog contains ${catalog.length} entries.`);
console.log(`Catalog: ${catalogPath}`);
