// Loads a script at runtime dynamically as a promise
export function loadDynamicScript(src: string, async: boolean = false): Promise<void> {
    return new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.onload = () => resolve();
        script.src = "https://apis.google.com/js/platform.js";
        script.async = async;

        document.head.appendChild(script);
    });
}
