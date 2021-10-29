export async function LoadingScreen(
    id: string,
    initialPercent: number,
    segments: [
        number,
        string,
        (onProgress?: (partsDone: number, partsTotal: number) => Promise<void>) => Promise<void>
    ][]
    ): Promise<void> {

    const loadingText = document.getElementById(id + "-text");
    const loadingBar = document.getElementById(id + "-progress-bar");
    const setText = (text: string) => loadingText.innerHTML = text;
    const setProgress = (amount: number) => loadingBar.style.width = amount + "%";

    setProgress(initialPercent);

    for (let [endPercent, label, fn] of segments) {
        setText(label);
        await fn();
        setProgress(endPercent);
    }

    document.getElementById(id).style.display = "none";
}
