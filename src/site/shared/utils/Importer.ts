
export function LoadFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (!reader.result)
                throw new Error("LoadFile failed: reader.result is undefined");
            resolve(reader.result.toString());
        };
        reader.onabort = reader.onerror = () => { reject("Failed to load file!"); };
        reader.readAsText(file);
    });
}
