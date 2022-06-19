import {getStackTrace, isError} from "./Errors";


/**
 * This function manages a loading screen. The loading screen will iterate over the provided
 * functions to load the site while updating text and a loading bar to indicate progress to the user.
 * The text area that is updated must have an id equal to the supplied id with "-text" appended.
 * The progress bar must similarly have an id with "-progress-bar" appended.
 *
 * @param id             The HTML id of the loading screen div.
 * @param initialPercent The percent to start the loading screen at.
 * @param segments       An array with the percentage at which loading that segment ends, a text label to
 *                 indicate to the user what is currently loading, and the function itself along with an optional
 *                 function to call to update for progress that happens between segments.
 */
export async function LoadingScreen(
    id: string,
    initialPercent: number,
    segments: Array<[
        number,
        string,
        (onProgress: (percentDone: number) => void) => Promise<void>,
    ]>
): Promise<void> {
    const loadingText = document.getElementById(`${id}-text`)!;
    const loadingBar  = document.getElementById(`${id}-progress-bar`)!;

    const setText     = (text: string)   => loadingText.innerHTML = text;
    const setProgress = (amount: number) => loadingBar.style.width = amount + "%";

    let errored = false;
    let curPercent: number;
    setProgress((curPercent = initialPercent));

    for (const [endPercent, label, fn] of segments) {
        setText(label);

        try {
            await fn((percentDone) => {
                // Update "sub-percent", i.e. for Images, would show progress as images load
                if (errored)
                    return;
                setProgress(curPercent + (endPercent - curPercent) * percentDone);
                setText(`${label} (${Math.floor(percentDone*100)}%)`);
            });
        } catch (e) {
            // It's assumed any errors not caught within the segment function
            //  are critical enough to stop the site from loading
            errored = true;

            // Create URL to auto-fill a Github issue with the error
            const issueURL = new URL("https://github.com/OpenCircuits/OpenCircuits/issues/new");
            if (isError(e)) {
                issueURL.searchParams.set(
                    "body",
                    `Auto-generated error:\nError occurred while "${label}"\n${e.name}: ${e.message}\n` +
                        `${getStackTrace(e).join("\n")}\n`
                );
            }
            issueURL.searchParams.set(
                "title",
                e.toString()
            );

            // Set loading bar to red w/ Error and link to create issue for the error
            loadingBar.style.backgroundColor = "#f44336";
            loadingText.innerHTML =
                `<a href="${issueURL.toString()}" target="_blank" style="-webkit-touch-callout: default;">
                    Error occurred while "${label}". Please refresh the page.
                    <br />
                    If this error continues to occur, please click this text to submit a bug report.
                </a>`;

            console.error(e);

            return;
        }

        setProgress((curPercent = endPercent));
    }

    document.getElementById(id)!.style.display = "none";
}
