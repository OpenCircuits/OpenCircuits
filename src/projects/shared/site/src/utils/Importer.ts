
export function LoadFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            if (!reader.result)
                throw new Error("LoadFile failed: reader.result is undefined");
            resolve(reader.result.toString());
        });
        reader.addEventListener("abort", () => reject("Failed to load file!"));
        reader.addEventListener("error", () => reject("Failed to load file!"));
        reader.readAsText(file);
    });
}
