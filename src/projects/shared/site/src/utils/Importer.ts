export function LoadFile(file: File, type: "string" | "binary"): Promise<string | ArrayBuffer> {
    return type === "string" ? file.text() : file.arrayBuffer();
}
