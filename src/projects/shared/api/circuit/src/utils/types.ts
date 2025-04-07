export type CleanupFunc = () => void;

export function Cleanups(...cleanups: CleanupFunc[]): CleanupFunc {
    return () => {
        cleanups.forEach((c) => c());
    };
}
