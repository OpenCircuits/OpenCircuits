export type LoadingScreen = (
    id: string,
    initialPercent: number,
    segments: [
        number,
        string,
        (onProgress?: (percentComplete: number) => Promise<void>) => Promise<void>
    ]
) => Promise<void>;


