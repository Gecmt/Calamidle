<script lang="ts">
    import { asset } from "$app/paths";
    const url = (p: string) => asset(p.replace(/^\//, ""));
    import { onMount } from "svelte";
    import { fade, scale, slide } from "svelte/transition"
    import bosses from "#lib/data/bosses.json";


    export let data;

    let input: String = ""
    let gameCompleted: boolean = false

    let selectedWeaponIndex: number = data.weaponIndex;
    $: weapons = data.weapons;
    let submittedWeapons: any[] = [];
    let dailySubmittedWeapons: any[] = [];
    let gameLogs: any[] = [];
    let activeTab = "game";
    let logMode: string | null = null;
    let temporaryGame = false;
    let viewingLog = false;

    let bossInput: string = "";
    let bossIndex = data.bossIndex;
    let submittedBosses: string[] = [];
    let dailySubmittedBosses: string[] = [];
    let bossGameCompleted = false;
    let bossGameLogs: any[] = [];
    let viewingBossLog = false;
    let bossTemporaryGame = false;
    let filteredBosses: any[] = [];
    let bossListOpen = false;
    let bossLogListOpen = false;

    $: correctBoss = bosses[bossIndex];

    let useSpeeds = [
        "Insanely Fast Speed",
        "Very Fast Speed",
        "Fast Speed",
        "Average Speed",
        "Slow Speed",
        "Very Slow Speed",
        "Extremely Slow Speed",
        "Snail Speed"
    ]

    let knockbacks = [
        "No Knockback",
        "Extremely Weak Knockback",
        "Very Weak Knockback",
        "Weak Knockback",
        "Average Knockback",
        "Strong Knockback",
        "Very Strong Knockback",
        "Extremely Strong Knockback",
        "Insane Knockback"
    ]

    let rarityColors: string[] = [
        "#FFFFFF",
        "#9696FF",
        "#96FF96",
        "#FFC896",
        "#FF9696",
        "#FF96FF",
        "#D2A0FF",
        "#96FF0A",
        "#FFFF0A",
        "#05C8FF",
        "#FF2864",
        "#B428FF",
        "#8f1fcb",
        "#00dbab",
        "#00ee00",
        "#295bd3",
        "#481e85",
        "#ed00ed"
    ];

    let filterWeaponsListOpen: boolean = false;
    let filteredWeapons: string[] = []

    function closeFilteredWeapons(){
        filterWeaponsListOpen = false
    }

    function filterWeapons() {
        document.body.addEventListener("click", closeFilteredWeapons)
        filterWeaponsListOpen = true;
        let tempArray: any[] = [];
        if(input){
            for(var i = 0; i < Object.keys(weapons).length; i++){
                if(Object.keys(weapons)[i].toLowerCase().includes(input.toLowerCase()) && !submittedWeapons.includes(Object.keys(weapons)[i])){
                    tempArray = [...tempArray, Object.keys(weapons)[i]]
                }
            }
        }
        filteredWeapons = tempArray;
    }

    let activeHint = ""

    $: correctWeapon = {
        name: Object.keys(weapons)[selectedWeaponIndex],
        damage: weapons[Object.keys(weapons)[selectedWeaponIndex]]["damage"],
        damagetype: weapons[Object.keys(weapons)[selectedWeaponIndex]]["damagetype"],
        knockback: weapons[Object.keys(weapons)[selectedWeaponIndex]]["knockback"],
        useSpeed: weapons[Object.keys(weapons)[selectedWeaponIndex]]["speed"],
        rarity: weapons[Object.keys(weapons)[selectedWeaponIndex]]["rarity"],
        obtained: weapons[Object.keys(weapons)[selectedWeaponIndex]]["obtained"],
        isAutoSwing: weapons[Object.keys(weapons)[selectedWeaponIndex]]["isAutoSwing"],
        isMaterial: weapons[Object.keys(weapons)[selectedWeaponIndex]]["isMaterial"],
        tooltip: weapons[Object.keys(weapons)[selectedWeaponIndex]]["tooltip"],
        sellValue: weapons[Object.keys(weapons)[selectedWeaponIndex]]["sellValue"]
    }

    function saveDailyGameLog() {
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

    function activateHint(hint: string, tries: number){
        if(gameCompleted == true && activeHint != hint){
            activeHint = hint
            console.log(activeHint)
            return
        }
        else if(gameCompleted == true && activeHint == hint){
            activeHint = ""
            return
        }

        if(submittedWeapons.length >= tries && activeHint != hint)
        {
            activeHint = hint
        }
        else if(activeHint == hint)
        {
            activeHint = ""
        }
    }

    function changeWeapon() {
        let weaponCount = Object.keys(weapons).length;
        let newIndex = selectedWeaponIndex;

        while (newIndex === selectedWeaponIndex && weaponCount > 1) {
             newIndex = Math.floor(Math.random() * weaponCount);
        }

        selectedWeaponIndex = newIndex;
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
        logMode = null;
        viewingLog = false;
    }

    function showWeaponGameLogs() {
        activeTab = "logs";
        logMode = "weapons";
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

    const handleObtainedOverlaps = (weaponName: string) => {
        for(var i = 0; i < weapons[weaponName].obtained.length; i++){
            if(correctWeapon.obtained.includes(weapons[weaponName].obtained[i])){
                return true
            }
        }
        return false
    }

    function saveBossDailyLog() {
        const boss = bosses[bossIndex];
        const date = new Date(data.day * 86400000).toLocaleDateString("en-GB");

        const entry = {
            day: data.day,
            date,
            bossIndex,
            bossName: boss.name,
            guesses: [...dailySubmittedBosses],
            completed: dailySubmittedBosses.includes(boss.name)
        };

        const existingIndex = bossGameLogs.findIndex(game => game.day === data.day);

        if (existingIndex !== -1) {
            bossGameLogs[existingIndex] = entry;
        } else {
            bossGameLogs = [entry, ...bossGameLogs];
        }

        localStorage.setItem("bossGameLogs", JSON.stringify(bossGameLogs));
    }

    function filterBosses() {
        const search = bossInput.trim().toLowerCase();

        if (!search) {
            filteredBosses = [];
            bossListOpen = false;
            return;
        }

        filteredBosses = bosses.filter((boss: any) =>
            boss.name.toLowerCase().includes(search) &&
            !submittedBosses.includes(boss.name)
        );

        bossListOpen = true;
    }

    function getBoss(bossName: string) {
        return bosses.find((boss: any) => boss.name === bossName);
    }

    function submitBossGuess() {
        const guess = bossInput.trim();

        if (!guess || !bosses.some(boss => boss.name === guess)) return;
        if (submittedBosses.includes(guess) || bossGameCompleted) return;

        submittedBosses = [guess, ...submittedBosses];

        if (guess === correctBoss.name) {
            bossGameCompleted = true;
        }

        if (!bossTemporaryGame && !viewingBossLog) {
            dailySubmittedBosses = [...submittedBosses];
            localStorage.setItem("submittedBosses", JSON.stringify(dailySubmittedBosses));
            saveBossDailyLog();
        }

        bossInput = "";
        filteredBosses = [];
        bossListOpen = false;
    }

    function getDailyBossIndex() {
        return data.bossIndex;
    }

    function showBossDailyGame() {
        bossIndex = getDailyBossIndex();
        submittedBosses = [...dailySubmittedBosses];
        bossGameCompleted = submittedBosses.includes(bosses[bossIndex].name);
        bossTemporaryGame = false;
        viewingBossLog = false;
        bossInput = "";
        activeTab = "bosses";
    }

    function startBossTemporaryGame() {
        let newIndex = bossIndex;

        if (bosses.length > 1) {
            while (newIndex === bossIndex) {
                newIndex = Math.floor(Math.random() * bosses.length);
            }
        }

        bossIndex = newIndex;
        submittedBosses = [];
        bossGameCompleted = false;
        bossTemporaryGame = true;
        viewingBossLog = false;
        bossInput = "";
        activeTab = "bosses";
    }

    function showBossGameLogs() {
        activeTab = "logs";
        logMode = "bosses";
        viewingBossLog = false;
    }

    function openBossLog(game: any) {
        bossIndex = game.bossIndex;
        submittedBosses = [...game.guesses];
        bossGameCompleted = game.completed;
        bossTemporaryGame = false;
        viewingBossLog = true;
        bossInput = "";
        activeTab = "bosses";
    }

    function getTypeMatch(guess: string | string[], target: string | string[]) {
        const guessTypes = Array.isArray(guess) ? guess : [guess];
        const targetTypes = Array.isArray(target) ? target : [target];

        const sharedTypes = guessTypes.filter(type => targetTypes.includes(type));

        if (
            guessTypes.length === targetTypes.length &&
            sharedTypes.length === targetTypes.length
        ) {
            return "bg-green-600";
        }

        if (sharedTypes.length > 0) {
            return "bg-yellow-500";
        }

        return "bg-red-600";
    }

    onMount(() => {
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

        // Load Boss Guessing data
        bossGameLogs = JSON.parse(localStorage.getItem("bossGameLogs") || "[]");

        const savedBossDay = localStorage.getItem("bossDay");

        if (savedBossDay !== null && JSON.parse(savedBossDay) === data.day) {
            dailySubmittedBosses = JSON.parse(localStorage.getItem("submittedBosses") || "[]");
        } else {
            dailySubmittedBosses = [];
            localStorage.removeItem("submittedBosses");
            localStorage.setItem("bossDay", JSON.stringify(data.day));
        }

        submittedBosses = [...dailySubmittedBosses];
        bossGameCompleted = submittedBosses.includes(correctBoss.name);

    });
</script>

<svelte:head/>
<!--Logo-->
<div class="mt-8 w-full h-24 px-3">
    <img
        class="mx-auto w-64 sm:w-80 drop-shadow-2xl -translate-y-[30%]"
        src={url("/logo.png")}
        alt="logo"
    />
</div>
<div class="w-full flex justify-center gap-3 mb-5 px-3">
    <button class="px-6 py-2 rounded-xl border border-black bg-red-950" on:click={showDailyGame}>Game</button>
    <button class="px-6 py-2 rounded-xl border border-black bg-red-950" on:click={showGameLogs}>Game Log</button>
    <button class="px-6 py-2 rounded-xl border border-black bg-red-950" on:click={() => activeTab = "bosses"}>Boss Guessing</button>
</div>
{#if activeTab === "game"}
{#if viewingLog}
    <div class="w-full flex justify-center mb-4">
        <button class="px-4 py-2 rounded-xl bg-red-950 border border-black" on:click={showWeaponGameLogs}>Back to Game Log</button>
    </div>
{/if}
<!-- Hint Area -->
<div>
    <div class="w-[85%] md:w-[45%] lg:w-[40%] max-w-[550px] px-4 py-1 -translate-y-1/4 mx-auto h-auto rounded-3xl bg-[#850825] border-[1.5px] border-black flex items-center">
        <p class="mx-auto text-lg md:text-2xl lg:text-3xl" style="text-shadow: black 0px 0px 5px;">Guess today's weapon!</p>
        <button
	class="mx-auto mt-2 mb-2 px-5 py-2 bg-red-950 border-black border-[1.5px] rounded-xl hover:bg-red-800"
	on:click={changeWeapon}>
	New Game (Doesn't Save)
        </button>
    </div>
    <div class="w-[95%] md:w-[50%] lg:w-[45%] max-w-[600px] h-fit -my-8 bg-red-900 mx-auto mb-3 rounded-2xl border-[1.5px] px-2 py-3 border-black flex flex-col">
        <div class="w-full translate-y-[10%] flex sm:gap-3 gap-2 my-3 h-full">
            <button class="w-full h-28 sm:h-24 py-2 px-[2px] bg-red-950 border-black border-[1.5px] rounded-2xl flex flex-col" on:click={() => activateHint("coins", 3)}>
                <div class="w-full h-full mb-1">
                    <img class="object-contain h-8 mx-auto" src={url("/hints/selling_price_hint.png")} alt="Selling Price"/>
                    <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">Selling Price</p>
                    {#if submittedWeapons.length < 3 && !gameCompleted}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">in {3 - submittedWeapons.length} tries</p>
                    {:else if !activeHint || activeHint != "coins" || gameCompleted && activeHint != "coins"}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">click to reveal</p>
                    {:else if activeHint == "coins"}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">click to hide</p>
                    {/if}
                </div>
            </button>
            <button class="w-full h-28 sm:h-24 py-2 px-[2px] bg-red-950 border-black border-[1.5px] rounded-2xl flex flex-col" on:click={() => activateHint("tooltip", 7)}>
                <div class="w-full h-fit mb-1">
                    <img class="object-contain h-8 mx-auto" src={url("/hints/tooltip_hint.png")} alt="Selling Price"/>
                    <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">Tooltip</p>
                    {#if submittedWeapons.length < 7 && !gameCompleted}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">in {7 - submittedWeapons.length} tries</p>
                    {:else if !activeHint || activeHint != "tooltip" || gameCompleted && activeHint != "tooltip"}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">click to reveal</p>
                    {:else if activeHint == "tooltip"}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">click to hide</p>
                    {/if}
                </div>
            </button>
            <button class="w-full h-28 sm:h-24 py-2 px-[2px] bg-red-950 border-black border-[1.5px] rounded-2xl flex flex-col" on:click={() => activateHint("image", 11)}>
                <div class="w-full h-fit mb-1">
                    <img class="object-contain h-8 mx-auto" src={url("/hints/image_hint.png")} alt="Selling Price"/>
                    <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">Image</p>
                    {#if submittedWeapons.length < 11 && !gameCompleted}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">in {11 - submittedWeapons.length} tries</p>
                    {:else if !activeHint || activeHint != "image" || gameCompleted && activeHint != "image"}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">click to reveal</p>
                    {:else if activeHint == "image"}
                        <p class="text-center h-auto py-1 text-xs leading-none" style="text-shadow: black 0px 0px 5px;">click to hide</p>
                    {/if}
                </div>
            </button>
        </div>
        {#if activeHint == "coins"}
            <div transition:slide class="bg-red-950 border-black border-[1.5px] mx-2 mt-2 h-10 rounded-2xl flex items-center justify-center">
                <p class="text-center text-sm leading-none {correctWeapon.sellValue.includes("Gold") ? "text-amber-300" : correctWeapon.sellValue.includes("Silver") ? "text-gray-400" : "text-amber-700"}" style="text-shadow: black 0px 0px 5px;">{correctWeapon.sellValue}</p>
            </div>
        {:else if activeHint == "tooltip"}
            <div transition:slide class="bg-red-950 border-black border-[1.5px] mx-2 mt-2 h-10 rounded-2xl flex items-center justify-center">
                <p class="text-center text-sm leading-none p-2" style="text-shadow: black 0px 0px 5px;">{correctWeapon.tooltip != null ? correctWeapon.tooltip?.replace(/(?<=\w{2})[^\s!%&'",.?]/g, "-") : "No tooltip"}</p>
            </div>
        {:else if activeHint == "image"}
            <div transition:slide class="bg-red-950 border-black border-[1.5px] mx-2 mt-2 h-10 rounded-2xl flex items-center justify-center">
                <img class="blur-sm" src={url("/weapons/" + correctWeapon.name?.replace(/ /g, "_") + ".png")} alt="blurred">
            </div>
        {/if}
        <div class="w-full mt-3">
            {#if !gameCompleted && !viewingLog}
                <form autocomplete="off" on:submit|preventDefault={() => { }}>
                    <div class="flex h-10 w-full px-2">
                        <input class="w-full rounded-xl p-2 bg-red-950 border-black border-[1.5px] text-white focus:outline focus:outline-2 focus:outline-red-400"  style="text-shadow: black 0px 0px 5px;" type="text" placeholder="Guess a weapon..." bind:value={input} on:input|stopPropagation={filterWeapons}/>
                        <button class="bg-red-950 rounded-xl size-10 ml-2 border-black border-[1.5px]" on:click={submitGuess}>
                            <img class="size-5 m-auto" src={url("/playbutton.png")} alt="enter"/>
                        </button>
                    </div>
                    {#if filterWeaponsListOpen && filteredWeapons.length > 0}
                        <ul class="ml-2 w-[80%] sm:w-[340px] max-h-56 h-fit bg-red-950 rounded-xl absolute overflow-y-scroll no-scrollbar">
                            {#each filteredWeapons as weaponName, i}
                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                                <li class="py-2 pl-3 flex items-center cursor-pointer hover:border-[2px] hover:border-red-400 hover:rounded-xl w-full h-14" on:click={() => {input=weaponName;}}>
                                    <div class="w-10 h-10 items-center flex justify-center">
                                        <img class="h-full object-scale-down" src={url("/weapons/" + weaponName.replace(/ /g, "_") + ".png")} alt={weaponName}/>
                                    </div>
                                    <p class="p-5 text-lg" style="text-shadow: black 0px 0px 5px;">{weaponName}</p>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </form>
            {/if}
        </div>              
    </div>
</div>
<!--Correct item image and description-->
{#if gameCompleted}
    <div transition:fade class="w-full h-fit flex flex-col items-center justify-center">
        <p class="text-lg" style="text-shadow: black 0px 0px 5px;">Guessed in {submittedWeapons.length == 1 ? submittedWeapons.length + " try!" : submittedWeapons.length + " tries!"}</p>
        <div class="bg-red-800/80 w-20 h-20 mt-2 flex items-center justify-center rounded-lg border-[1.5px] border-black">
            <img class="w-fit h-10" src={url("/weapons/" + correctWeapon.name?.replace(/ /g, "_") + ".png")} alt={correctWeapon.name}/>
        </div>
        <div class="bg-red-800/80 w-[90%] sm:w-80 h-fit rounded-lg mt-2 border-[1.5px] border-black px-3 py-4">
            <p class="leading-4 py-1" style="color:{rarityColors[correctWeapon.rarity]}; text-shadow: black 0px 0px 5px;">{correctWeapon.name}</p>
            <p class="leading-4 py-1" style="text-shadow: black 0px 0px 5px;">{correctWeapon.damage} {correctWeapon.damagetype} damage</p>
            <p class="leading-4 py-1" style="text-shadow: black 0px 0px 5px;">{correctWeapon.knockback}</p>
            <p class="leading-4 py-1" style="text-shadow: black 0px 0px 5px;">{correctWeapon.useSpeed}</p>
            {#if correctWeapon.isMaterial}
                <p class="leading-4 py-1" style="text-shadow: black 0px 0px 5px;">Material</p>
            {/if}
            <p class="leading-4 py-1" style="text-shadow: black 0px 0px 5px;">{correctWeapon.tooltip}</p>
        </div>
    </div>
{/if}
<!--Submitted Guesses Area-->
<div class="w-full flex justify-center">
    <div class="px-4 w-full xl:w-fit overflow-x-scroll xl:overflow-auto">
        <div class="mt-5 mx-auto w-[1200px] bg-[rgb(160,20,20,0.8)] border-black border-[1.5px] gap-1 text-center items-center flex justify-center">
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Item</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Damage Type</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Damage</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Knockback</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Use Speed</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Rarity</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Autoswing?</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Material?</div>
            <div class="w-32 text-[14px]" style="text-shadow: black 0px 0px 5px;">Obtained</div>
        </div>
        <ul class="w-[1200px]">
            {#each submittedWeapons as weapon (Object.keys(weapons).indexOf(weapon))}
                <li transition:scale class="mt-2 flex gap-1 justify-center">
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center bg-red-900/60 border-black border-[1.5px]">
                        <img class="max-w-10 max-h-10" src={url("/weapons/" + weapon.replace(/ /g, "_") + ".png")} alt={weapon}/>
                    </div>
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center {weapons[weapon].damagetype == correctWeapon.damagetype ? "bg-green-600" : "bg-red-600"} border-black border-[1.5px]">
                        <p>{weapons[weapon].damagetype}</p>
                    </div>
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center {weapons[weapon].damage == correctWeapon.damage ? "bg-green-600" : "bg-red-600"} border-black border-[1.5px]">
                        <p class="w-[70%] text-center leading-none" style="text-shadow: black 0px 0px 5px;">{weapons[weapon].damage}</p>
                        {#if parseInt(weapons[weapon].damage) > parseInt(correctWeapon.damage)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬇</p>
                        {:else if parseInt(weapons[weapon].damage) < parseInt(correctWeapon.damage)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬆</p>
                        {/if}
                    </div>
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center {weapons[weapon].knockback == correctWeapon.knockback ? "bg-green-600" : "bg-red-600"} border-black border-[1.5px]">
                        <p class="w-[70%] text-center leading-none" style="text-shadow: black 0px 0px 5px;">{weapons[weapon].knockback?.replace(" Knockback", "")}</p>
                        {#if knockbacks.indexOf(weapons[weapon].knockback) > knockbacks.indexOf(correctWeapon.knockback)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬇</p>
                        {:else if knockbacks.indexOf(weapons[weapon].knockback) < knockbacks.indexOf(correctWeapon.knockback)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬆</p>
                        {/if}
                    </div>
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center {weapons[weapon].speed == correctWeapon.useSpeed ? "bg-green-600" : "bg-red-600"} border-black border-[1.5px]">
                        <p class="w-[70%] text-center leading-none" style="text-shadow: black 0px 0px 5px;">{weapons[weapon].speed?.replace(" Speed", "")}</p>
                        {#if useSpeeds.indexOf(weapons[weapon].speed) < useSpeeds.indexOf(correctWeapon.useSpeed)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬇</p>
                        {:else if useSpeeds.indexOf(weapons[weapon].speed) > useSpeeds.indexOf(correctWeapon.useSpeed)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬆</p>
                        {/if}
                    </div>
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center {weapons[weapon].rarity == correctWeapon.rarity ? "bg-green-600" : "bg-red-600"} border-black border-[1.5px]">
                        <img class="w-[fit] text-center leading-none pr-1" src={url("/rarities/" + weapons[weapon].rarity + ".png")} alt="weapons[weapon].rarity"/>
                        {#if parseInt(weapons[weapon].rarity) > parseInt(correctWeapon.rarity)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬇</p>
                        {:else if parseInt(weapons[weapon].rarity) < parseInt(correctWeapon.rarity)}
                            <p class="text-center pl-2" style="text-shadow: black 0px 0px 5px;">⬆</p>
                        {/if}
                    </div>
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center {weapons[weapon].isAutoSwing == correctWeapon.isAutoSwing ? "bg-green-600" : "bg-red-600"} border-black border-[1.5px]">
                        {#if weapons[weapon].isAutoSwing == true}
                            <p style="text-shadow: black 0px 0px 5px;">Yes</p>
                        {:else}
                            <p style="text-shadow: black 0px 0px 5px;">No</p>
                        {/if}
                    </div>
                    <div class="flex w-[120px] h-16 mx-1 items-center justify-center {weapons[weapon].isMaterial == correctWeapon.isMaterial ? "bg-green-600" : "bg-red-600"} border-black border-[1.5px]">
                        {#if weapons[weapon].isMaterial == true}
                            <p style="text-shadow: black 0px 0px 5px;">Yes</p>
                        {:else}
                            <p style="text-shadow: black 0px 0px 5px;">No</p>
                        {/if}
                    </div>
                    {#if weapons[weapon].obtained.join(" ") == correctWeapon.obtained.join(" ")}
                        <div class="flex flex-col w-[120px] h-16 mx-1 items-center justify-center overflow-y-visible bg-green-600 border-black border-[1.5px]">
                            {#each weapons[weapon].obtained as method }
                                <p style="text-shadow: black 0px 0px 5px;">{method}</p>
                            {/each}
                        </div>
                    {:else if handleObtainedOverlaps(weapon) == true}
                        <div class="flex flex-col w-[120px] h-16 mx-1 items-center justify-center overflow-y-visible bg-orange-600 border-black border-[1.5px]">
                            {#each weapons[weapon].obtained as method }
                                <p style="text-shadow: black 0px 0px 5px;">{method}</p>
                            {/each}
                        </div>
                    {:else}
                        <div class="flex flex-col w-[120px] h-16 mx-1 items-center justify-center overflow-y-visible bg-red-600 border-black border-[1.5px]">
                            {#each weapons[weapon].obtained as method }
                                <p style="text-shadow: black 0px 0px 5px;">{method}</p>
                            {/each}
                        </div>
                    {/if}
                    
                </li>
            {/each}
        </ul>
    </div>
</div>

{:else if activeTab === "logs"}
<div class="w-[95%] md:w-[70%] max-w-[700px] mx-auto bg-red-900 border border-black rounded-2xl p-4">
    {#if logMode === null}
        <h2 class="text-2xl text-center mb-4">Choose Game Mode</h2>

        <div class="flex flex-col gap-3">
            <button
                class="w-full p-4 rounded-xl bg-red-950 border border-black"
                on:click={() => logMode = "weapons"}
            >
                Weapon Guessing
            </button>

            <button
                class="w-full p-4 rounded-xl bg-red-950 border border-black"
                on:click={() => logMode = "bosses"}
            >
                Boss Guessing
            </button>
        </div>

    {:else if logMode === "weapons"}
        <div class="flex items-center justify-between mb-4">
            <button
                class="px-3 py-2 rounded-xl bg-red-950 border border-black"
                on:click={() => logMode = null}
            >
                Back
            </button>
            <h2 class="text-xl">Weapon Game Log</h2>
        </div>

        {#if gameLogs.length === 0}
            <p class="text-center py-6">No daily weapon games saved yet.</p>
        {:else}
            <div class="flex flex-col gap-3">
                {#each gameLogs as game (game.day)}
                    <button
                        class="w-full p-4 rounded-xl bg-red-950 border border-black text-left"
                        on:click={() => openLog(game)}
                    >
                        <div class="flex justify-between items-center gap-3">
                            <span>Game [{game.date}]</span>
                            <span class="text-sm">{game.completed ? "Completed" : "Incomplete"}</span>
                        </div>
                        <p class="text-sm mt-1">{game.guesses.length} guesses</p>
                    </button>
                {/each}
            </div>
        {/if}

    {:else if logMode === "bosses"}
        <div class="flex items-center justify-between mb-4">
            <button
                class="px-3 py-2 rounded-xl bg-red-950 border border-black"
                on:click={() => logMode = null}
            >
                Back
            </button>
            <h2 class="text-xl">Boss Game Log</h2>
        </div>

        {#if bossGameLogs.length === 0}
            <p class="text-center py-6">No daily boss games saved yet.</p>
        {:else}
            <div class="flex flex-col gap-3">
                {#each bossGameLogs as game (game.day)}
                    <button
                        class="w-full p-4 rounded-xl bg-red-950 border border-black text-left"
                        on:click={() => openBossLog(game)}
                    >
                        <div class="flex justify-between items-center gap-3">
                            <span>Game [{game.date}]</span>
                            <span class="text-sm">{game.completed ? "Completed" : "Incomplete"}</span>
                        </div>
                        <p class="text-sm mt-1">{game.bossName} · {game.guesses.length} guesses</p>
                    </button>
                {/each}
            </div>
        {/if}
    {/if}
</div>
{:else if activeTab === "bosses"}
    <div class="w-[95%] md:w-[70%] max-w-[700px] mx-auto bg-red-900 border border-black rounded-2xl p-4">
        <h2 class="text-2xl text-center mb-4">Boss Guessing</h2>
        {#if viewingBossLog}
            <button
                class="bg-red-950 border border-black rounded-xl px-3 py-2 mb-3"
                on:click={showBossGameLogs}
            >
                Back to Boss Game Log
            </button>
        {/if}
        <div class="flex flex-col gap-3">
            <div class="flex flex-wrap justify-center gap-2 mb-4">
                <button
                    class="bg-red-950 border border-black rounded-xl px-3 py-2"
                    on:click={showBossDailyGame}
                >
                    Today's Boss
                </button>

                <button
                    class="bg-red-950 border border-black rounded-xl px-3 py-2"
                    on:click={startBossTemporaryGame}
                >
                    New Game (Doesn't Save)
                </button>
            </div>
            <form autocomplete="off" on:submit|preventDefault={submitBossGuess}>
                <div class="flex h-10 w-full">
                    <input
                        class="w-full rounded-xl p-2 bg-red-950 border border-black text-white focus:outline focus:outline-2 focus:outline-red-400"
                        type="text"
                        placeholder="Guess a boss..."
                        bind:value={bossInput}
                        on:input={filterBosses}
                        disabled={bossGameCompleted}
                    />

                    <button
                        type="submit"
                        class="bg-red-950 rounded-xl w-12 ml-2 border border-black"
                        disabled={bossGameCompleted}
                    >
                        <img class="size-5 m-auto" src={url("/playbutton.png")} alt="Enter"/>
                    </button>
                </div>

                {#if bossListOpen && filteredBosses.length > 0}
                    <ul class="w-[80%] sm:w-[340px] max-h-56 bg-red-950 rounded-xl absolute overflow-y-auto z-10">
                        {#each filteredBosses as boss}
                            <li>
                                <button
                                    type="button"
                                    class="py-2 px-3 flex items-center hover:bg-red-800 w-full text-left"
                                    on:click={() => {
                                        bossInput = boss.name;
                                        bossListOpen = false;
                                    }}
                                >
                                    <div class="flex items-center gap-1 shrink-0">
                                        {#each boss.images as image}
                                            <img class="w-8 h-8 object-contain" src={url(image)} alt=""/>
                                        {/each}
                                    </div>
                                    <span>{boss.name}</span>
                                </button>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </form>
            {#if bossGameCompleted}
                <div class="bg-green-800 border border-black rounded-xl p-4 text-center">
                    <h2 class="text-2xl font-bold">Victory!</h2>
                    <p>You guessed {correctBoss.name}!</p>
                </div>
            {/if}

            <div class="flex flex-col gap-3">
                {#each submittedBosses as bossName}
                    {@const boss = getBoss(bossName)}
                    <div class="bg-red-900 border border-black rounded-xl p-3">

                        <!-- Boss name and icons -->
                        <div class="flex items-center gap-3 mb-3">
                            <div class="flex items-center gap-1 flex-wrap">
                                {#each boss.images as image}
                                    <img
                                        class="w-10 h-10 object-contain"
                                        src={url(image)}
                                        alt={boss.name}
                                    />
                                {/each}
                            </div>

                            <p class="text-lg">{boss.name}</p>
                        </div>

                        <!-- Category comparisons -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div class="p-2 rounded-lg text-center border border-black {boss.gender === correctBoss.gender ? 'bg-green-600' : 'bg-red-600'}">
                                <p class="text-xs opacity-80">Gender</p>
                                <p>{boss.gender}</p>
                            </div>

                            <div class="p-2 rounded-lg text-center border border-black {boss.progression === correctBoss.progression ? 'bg-green-600' : 'bg-red-600'}">
                                <p class="text-xs opacity-80">Progression</p>
                                <p class="text-sm">{boss.progression}</p>
                            </div>

                            <div class="p-2 rounded-lg text-center border border-black {getTypeMatch(boss.type, correctBoss.type)}">
                                <p class="text-xs opacity-80">Type</p>
                                <p>{Array.isArray(boss.type) ? boss.type.join(" / ") : boss.type}</p>
                            </div>

                            <div class="p-2 rounded-lg text-center border border-black {boss.stage === correctBoss.stage ? 'bg-green-600' : 'bg-red-600'}">
                                <p class="text-xs opacity-80">Stage</p>
                                <p class="text-sm">{boss.stage}</p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

        </div>
    </div>
{/if}
<!--Footer-->
<div class="mt-10 sm:mt-20 w-full flex flex-col items-center justify-center mb-4">
    <p class="text-lg text-center">To report incorrect info, you can message me (@Gecmt) on Discord.
    </p>
    <p class="text-lg text-center">Inspired by 
        <a class="text-green-500 text-lg" href="https://terradle.com" target="_blank">Terradle</a> by
        <a class="text-yellow-500 text-lg" href="https://github.com/cxhuy" target="_blank">cxhuy</a>
    </p>
    <p class="text-lg text-center">Edited from (original project):
        <a class="text-red-500 text-lg" href="https://github.com/Obbaxobax" target="_blank">Obbax</a>
    </p>
        <p class="text-lg text-center">Modified by
        <a class="text-red-500 text-lg" href="https://github.com/Gecmt" target="_blank">Gecmt</a>
    </p>
</div>
