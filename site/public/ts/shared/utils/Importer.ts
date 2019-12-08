
export function LoadFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result.toString());
        };
        reader.onabort = reader.onerror = () => { reject("Failed to load file!"); };
        reader.readAsText(file);
    });
}
