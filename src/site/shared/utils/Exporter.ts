

export function SaveFile(data: string, name: string): void {
    // Get name
    if (name.replace(/\s+/g, "") === "")
        name = "Untitled Circuit";
    const filename = name + ".circuit";
    const file = new Blob([data], {type: "text/json"});
    if ((window.navigator as any).msSaveOrOpenBlob) { // IE10+
        (window.navigator as any).msSaveOrOpenBlob(file, filename);
    } else { // Others
        const a = document.createElement("a");
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
