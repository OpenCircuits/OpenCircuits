/**
 * This function manages a loading screen. The loading screen will iterate over the provided
 * functions to load the site while updating text and a loading bar to indicate progress to the user.
 * The text area that is updated must have an id equal to the supplied id with "-text" appended.
 * The progress bar must similarly have an id with "-progress-bar" appended.
 * 
 * @param id the HTML id of the loading screen div
 * @param initialPercent the percent to start the loading screen at
 * @param segments an array with the percentage at which loading that segment ends, a text label to
 *      indicate to the user what is currently loading, and the function itself along with an optional
 *      function to call to update for progress that happens between segments
 */
export async function LoadingScreen(
    id: string,
    initialPercent: number,
    segments: [
        number,
        string,
        (onProgress?: (percentDone: number) => Promise<void>) => Promise<void>
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
