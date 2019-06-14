export const LoadingScreen = (function() {
    const div = document.getElementById("loading-screen");

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
