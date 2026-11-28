"use strict";

// Godot's regular preloader consumes a Response. Join same-origin static
// pieces as a stream, so the WebAssembly compiler can work while downloading.
window.fetchDinoAsset = function (input, options) {
    const asset = typeof input === "string" && window.dinoAssets[input];
    if (!asset) return window.fetch(input, options);
    let partIndex = 0;
    let reader;
    let bytesRead = 0;
    const cancel = new AbortController();
    let stream = new ReadableStream({
        async pull(controller) {
            try {
                while (partIndex < asset.parts.length) {
                    const part = asset.parts[partIndex];
                    if (!reader) {
                        const result = await fetch(part.name, {signal: cancel.signal});
                        if (!result.ok) throw Error(part.name + " HTTP " + result.status);
                        reader = result.body.getReader();
                        bytesRead = 0;
                    }
                    const next = await reader.read();
                    if (!next.done) {
                        bytesRead += next.value.byteLength;
                        controller.enqueue(next.value);
                        return;
                    }
                    if (bytesRead !== part.bytes) throw Error("Incomplete download: " + part.name);
                    reader.releaseLock();
                    reader = null;
                    partIndex += 1;
                }
                controller.close();
            } catch (error) {
                cancel.abort();
                controller.error(error);
            }
        },
        cancel() {
            cancel.abort();
            return reader && reader.cancel();
        }
    });
    if (asset.gzip) stream = stream.pipeThrough(new DecompressionStream("gzip"));
    return Promise.resolve(new Response(stream, {headers: {
        "Content-Type": asset.type, "Content-Length": String(asset.size)
    }}));
};

(function () {
    const strings = {
        de: ["Das Wehr und Samis Dino-Insel", "Spielen", "Spielfeld", "Die Insel lädt …", "Erneut laden",
            "Das Spiel konnte nicht geladen werden. Prüfe deine Verbindung und versuche es noch einmal.",
            "Dieses Spiel braucht WebGL 2 und einen aktuellen Browser."],
        en: ["The Weir and Sami’s Dino Island", "Play", "Game area", "Loading the island…", "Reload",
            "The game could not load. Check your connection and try again.",
            "This game needs WebGL 2 and a current browser."],
        zh: ["水坝与萨米的恐龙岛", "开始游戏", "游戏画面", "正在加载岛屿…", "重新加载",
            "游戏加载失败。请检查网络连接后重试。", "游戏需要支持 WebGL 2 的新版浏览器。"]
    };
    const requested = new URLSearchParams(location.search).get("lang");
    const shortLang = tag => String(tag || "").toLowerCase().split(/[-_]/)[0];
    const lang = [requested, ...(navigator.languages || [navigator.language])]
        .map(shortLang).find(key => Object.hasOwn(strings, key)) || "de";
    const locale = lang === "zh" ? "zh_CN" : lang;
    const labels = strings[lang];
    const canvas = document.getElementById("canvas");
    const launch = document.getElementById("launch");
    const play = document.getElementById("play");
    const progress = document.getElementById("progress");
    const status = document.getElementById("status");
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
    document.title = document.getElementById("title").textContent = labels[0];
    canvas.setAttribute("aria-label", labels[2]);
    play.textContent = labels[1];
    const touchDevice = matchMedia("(pointer: coarse)");
    function resize() {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const maxScale = touchDevice.matches ? 1.25 : 2;
        const pixelBudget = touchDevice.matches ? 1400000 : 4200000;
        const density = Math.min(devicePixelRatio || 1, maxScale, Math.sqrt(pixelBudget / (rect.width * rect.height)));
        const width = Math.max(1, Math.round(rect.width * density));
        const height = Math.max(1, Math.round(rect.height * density));
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
    }
    new ResizeObserver(resize).observe(canvas);
    window.addEventListener("resize", resize);
    resize();
    // A long press in the world is a held tool, not a browser context menu.
    canvas.addEventListener("contextmenu", event => event.preventDefault());
    let loading = false;
    let failed = false;
    const showError = (error, message = labels[5]) => {
        console.error(error);
        failed = true;
        loading = false;
        launch.hidden = false;
        progress.hidden = true;
        play.hidden = false;
        play.textContent = labels[4];
        status.textContent = message;
    };
    window.addEventListener("unhandledrejection", event => {
        if (loading) showError(event.reason);
    });
    play.addEventListener("click", async () => {
        if (failed) return location.reload();
        if (loading) return;
        loading = true;
        play.hidden = true;
        try {
            const missing = Engine.getMissingFeatures({threads: false});
            if (missing.length || !window.DecompressionStream)
                return showError("Missing: " + [...missing, ...(!window.DecompressionStream ? ["gzip"] : [])].join(", "), labels[6]);
            status.textContent = labels[3];
            progress.hidden = false;
            const engine = new Engine({
                executable: "index", canvas, canvasResizePolicy: 0, focusCanvas: true, locale,
                fileSizes: {"index.wasm": dinoAssets["index.wasm"].size, "index.pck": dinoAssets["index.pck"].size},
                args: ["--", "--site-lang=" + locale],
                onProgress(loaded, total) {
                    if (total > 0) progress.value = loaded / total;
                }
            });
            await engine.startGame();
            if (failed) return;
            loading = false;
            launch.hidden = true;
            canvas.focus({preventScroll: true});
        } catch (error) {
            showError(error);
        }
    });
})();
