import {Request} from "shared/utils/Request";


export async function DevCreateFile(data: string, fileId: string): Promise<void> {
    await Request({
        method:  "POST",
        url:     `dev/file/${fileId}`,
        headers: {
            "Content-Type": "text/plain",
        },
        data,
    });
}

export async function DevListFiles(): Promise<string[]> {
    const result = await Request({
        method:  "GET",
        url:     "dev/filelist",
        headers: {},
    });
    return JSON.parse(result)["files"];
}

export async function DevGetFile(fileId: string): Promise<string> {
    return await Request({
        method:  "GET",
        url:     `dev/file/${fileId}`,
        headers: {},
    });
}
