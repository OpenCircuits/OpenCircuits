// Loads a script at runtime dynamically as a promise
export function LoadDynamicScript(src: string, async: boolean = false): Promise<void> {
    return new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.onload = () => resolve();
        script.async = async;
        script.defer = true;
        script.src = src;

        document.head.appendChild(script);
    });
}
