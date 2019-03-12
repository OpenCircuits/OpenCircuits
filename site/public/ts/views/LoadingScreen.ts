export const LoadingScreen = (function() {
    let div = document.getElementById("loading-screen");

    return {
        Show() {
            if (div.classList.contains("invisible"))
                div.classList.remove("invisible");
        },
        Hide() {
            if (!div.classList.contains("invisible"))
                div.classList.add("invisible");
        }
    };
})();
