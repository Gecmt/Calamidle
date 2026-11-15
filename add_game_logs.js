import fs from "node:fs";

const file = "src/routes/+page.svelte";
let s = fs.readFileSync(file, "utf8");

function requireMatch(regex, description) {
if (!regex.test(s)) {
throw new Error("Could not find " + description + ". No changes were saved.");
}
}

requireMatch(/let submittedWeapons: any\[\] = \[\]/, "submittedWeapons");
requireMatch(/function submitGuess\(\)/, "submitGuess()");
requireMatch(/function changeWeapon\(\)/, "changeWeapon()");
requireMatch(/onMount\(\(\) => \{/, "onMount()");
requireMatch(/<!--Hint Area-->/, "Hint Area");
requireMatch(/<!--Footer-->/, "Footer");

if (s.includes("let gameLogs: any[]")) {
throw new Error("Game Log code already exists. No changes were saved.");
}

s = s.replace(
"let submittedWeapons: any[] = []",
`let submittedWeapons: any[] = [];
let dailySubmittedWeapons: any[] = [];
let gameLogs: any[] = [];
let activeTab = "game";
let temporaryGame = false;
let viewingLog = false;`
);

const submitStart = s.indexOf("    function submitGuess()");
const submitEnd = s.indexOf("    function activateHint(", submitStart);

if (submitStart === -1 || submitEnd === -1) {
throw new Error("Could not locate submitGuess boundaries. No changes were saved.");
}

s = s.slice(0, submitStart) + `    function saveDailyGameLog() {
        const weaponName = Object.keys(weapons)[data.weaponIndex];
        const date = new Date(data.day * 86400000).toLocaleDateString("en-GB");

        const entry = {
            day: data.day,
            date,
            weaponIndex: data.weaponIndex,
            weaponName,
            guesses: [...dailySubmittedWeapons],
            completed: dailySubmittedWeapons.includes(weaponName)
        };

        const existingIndex = gameLogs.findIndex(game => game.day === data.day);

        if (existingIndex !== -1) {
            gameLogs[existingIndex] = entry;
        } else {
            gameLogs = [entry, ...gameLogs];
        }

        localStorage.setItem("gameLogs", JSON.stringify(gameLogs));
    }

    function submitGuess() {
        const guess = input.trim();

        if (!guess) return;

        if (weapons[guess] != null && !submittedWeapons.includes(guess)) {
            submittedWeapons = [guess, ...submittedWeapons];

            if (guess === correctWeapon.name) {
                gameCompleted = true;
            }

            input = "";
        } else if (guess === "Supreme Calamitas") {
            gameCompleted = true;
            input = "";

            if (!submittedWeapons.includes(correctWeapon.name)) {
                submittedWeapons = [correctWeapon.name, ...submittedWeapons];
            }
        }

        if (!temporaryGame && !viewingLog) {
            dailySubmittedWeapons = [...submittedWeapons];
            localStorage.setItem("submittedWeapons", JSON.stringify(dailySubmittedWeapons));
            saveDailyGameLog();
        }
    }

` + s.slice(submitEnd);

const resetStart = s.indexOf("    function reset()");
const changeStart = s.indexOf("    function changeWeapon()", resetStart);

if (resetStart === -1 || changeStart === -1) {
throw new Error("Could not locate reset/changeWeapon functions. No changes were saved.");
}

const changeEnd = s.indexOf("    const handleObtainedOverlaps", changeStart);

if (changeEnd === -1) {
throw new Error("Could not locate handleObtainedOverlaps. No changes were saved.");
}

s = s.slice(0, resetStart) + `    function changeWeapon() {
        selectedWeaponIndex = (selectedWeaponIndex + 1) % Object.keys(weapons).length;
        submittedWeapons = [];
        gameCompleted = false;
        activeHint = "";
        input = "";
        temporaryGame = true;
        viewingLog = false;
        activeTab = "game";
    }

    function showDailyGame() {
        selectedWeaponIndex = data.weaponIndex;
        submittedWeapons = [...dailySubmittedWeapons];
        gameCompleted = dailySubmittedWeapons.includes(Object.keys(weapons)[data.weaponIndex]);
        activeHint = "";
        input = "";
        temporaryGame = false;
        viewingLog = false;
        activeTab = "game";
    }

    function showGameLogs() {
        activeTab = "logs";
        viewingLog = false;
    }

    function openLog(game: any) {
        selectedWeaponIndex = game.weaponIndex;
        submittedWeapons = [...game.guesses];
        gameCompleted = game.completed;
        activeHint = "";
        input = "";
        temporaryGame = false;
        viewingLog = true;
        activeTab = "game";
    }

` + s.slice(changeEnd);

const mountStart = s.indexOf("    onMount(() => {");
const scriptEnd = s.indexOf("</script>", mountStart);

if (mountStart === -1 || scriptEnd === -1) {
throw new Error("Could not locate onMount or script ending. No changes were saved.");
}

s = s.slice(0, mountStart) + `    onMount(() => {
        gameLogs = JSON.parse(localStorage.getItem("gameLogs") || "[]");

        const savedDay = localStorage.getItem("day");

        if (savedDay !== null && JSON.parse(savedDay) === data.day) {
            dailySubmittedWeapons = JSON.parse(localStorage.getItem("submittedWeapons") || "[]");
        } else {
            dailySubmittedWeapons = [];
            localStorage.removeItem("submittedWeapons");
            localStorage.setItem("day", JSON.stringify(data.day));
        }

        submittedWeapons = [...dailySubmittedWeapons];

        if (submittedWeapons.includes(correctWeapon.name)) {
            gameCompleted = true;
        }
    });
` + s.slice(scriptEnd);

s = s.replace(
"<!--Hint Area-->",
`<div class="w-full flex justify-center gap-3 mb-5 px-3">
    <button class="px-6 py-2 rounded-xl border border-black bg-red-950" on:click={showDailyGame}>Game</button>
    <button class="px-6 py-2 rounded-xl border border-black bg-red-950" on:click={showGameLogs}>Game Log</button>
</div>
{#if activeTab === "game"}
{#if viewingLog}
    <div class="w-full flex justify-center mb-4">
        <button class="px-4 py-2 rounded-xl bg-red-950 border border-black" on:click={showGameLogs}>Back to Game Log</button>
    </div>
{/if}
<!-- Hint Area -->`
);

const hintIndex = s.indexOf("<!-- Hint Area -->");
const footerIndex = s.indexOf("<!--Footer-->");

if (hintIndex === -1 || footerIndex === -1 || footerIndex < hintIndex) {
throw new Error("Could not locate game area boundaries. No changes were saved.");
}

const logMarkup = `
{:else}
<div class="w-[95%] md:w-[70%] max-w-[700px] mx-auto bg-red-900 border border-black rounded-2xl p-4">
    <h2 class="text-2xl text-center mb-4">Game Log</h2>
    {#if gameLogs.length === 0}
        <p class="text-center py-6">No daily games saved yet. Play today's game to create your first log entry!</p>
    {:else}
        <div class="flex flex-col gap-3">
            {#each gameLogs as game (game.day)}
                <button class="w-full p-4 rounded-xl bg-red-950 border border-black text-left" on:click={() => openLog(game)}>
                    <div class="flex justify-between items-center gap-3">
                        <span>Game [{game.date}]</span>
                        <span class="text-sm">{game.completed ? "Completed" : "Incomplete"}</span>
                    </div>
                    <p class="text-sm mt-1">{game.guesses.length} guesses</p>
                </button>
            {/each}
        </div>
    {/if}
</div>
{/if}
`;

s = s.slice(0, footerIndex) + logMarkup + s.slice(footerIndex);

s = s.replace(
"{#if !gameCompleted}",
"{#if !gameCompleted && !viewingLog}"
);

const resetButton = /\s*<div class="mt-3 py-2 w-20 rounded-lg bg-red-800 border-\[1\.5px\] border-black\s+flex items-center justify-center">\s*<button class="w-full h-full" on:click=\{reset\}>Reset<\/button>\s*<\/div>/;

s = s.replace(resetButton, "");

if (s.includes("on:click={reset}")) {
throw new Error("A Reset button reference remains. No changes were saved.");
}

fs.writeFileSync(file, s);
console.log("Game Log patch applied successfully!");
