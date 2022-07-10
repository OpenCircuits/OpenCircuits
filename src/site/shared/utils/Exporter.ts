

/**
 * Utility function to save a file through the browser to the user's disk.
 *  This opens the default-OS file-browser to allow the user to save to a specific location.
 *
 * @param dataURL The url-encoded data to save.
 * @param name    The project name, which will auto-replace with "Untitled Circuit" if empty.
 * @param type    The type of file to save, i.e. "circuit", "png", "jpeg", etc.
 */
export function SaveFile(dataURL: string, name: string, type: string): void {
    // Get name
    if (name.replace(/\s+/g, "") === "")
        name = "Untitled Circuit";
    const filename = `${name}.${type}`;

    const a = document.createElement("a");
    a.href = dataURL;
    a.download = filename;
    document.body.append(a);
    a.click();
    setTimeout(() => {
        a.remove();
        window.URL.revokeObjectURL(dataURL);
    }, 0);
}
