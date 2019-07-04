export const LoadingScreen = (() => {
    const div = document.getElementById("loading-screen");

    return {
        Show(): void {
            if (div.classList.contains("invisible"))
                div.classList.remove("invisible");
        },
        Hide(): void {
            if (!div.classList.contains("invisible"))
                div.classList.add("invisible");
        }
    };
})();
