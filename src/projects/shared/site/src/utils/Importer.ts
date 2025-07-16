export function LoadFile(file: File, type: "string" | "binary"): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const result = reader.result;
            if (!result)
                throw new Error("LoadFile failed: reader.result is undefined");
            resolve(reader.result);
        });
        reader.addEventListener("abort", () => reject("Failed to load file!"));
        reader.addEventListener("error", () => reject("Failed to load file!"));
        if (type === "string")
            reader.readAsText(file);
        else
            reader.readAsArrayBuffer(file);
    });
}
