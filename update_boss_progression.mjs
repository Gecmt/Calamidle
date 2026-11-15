import fs from "node:fs";

const file = "src/lib/data/bosses.json";
const bosses = JSON.parse(fs.readFileSync(file, "utf8"));

const main = new Set([
"Eater of Worlds",
"Brain of Cthulhu",
"Skeletron",
"Supreme Witch, Calamitas",
"Exo Mechs"
]);

const semi = new Set([
"Eye of Cthulhu",
"The Hive Mind",
"The Perforators",
"The Slime God",
"Cryogen",
"Calamitas Clone",
"Astrum Deus",
"Polterghast"
]);

for (const boss of bosses) {
if (main.has(boss.name) || boss.progression === "Required") {
boss.progression = "Main Progression";
} else if (semi.has(boss.name)) {
boss.progression = "Semi-Required";
} else {
boss.progression = "Optional";
}
}

fs.writeFileSync(file, JSON.stringify(bosses, null, 2) + "\n");

console.log("Updated progression categories:");
for (const category of ["Main Progression", "Semi-Required", "Optional"]) {
console.log(`${category}: ${bosses.filter(b => b.progression === category).length}`);
}
