// Distributed Omit, see https://stackoverflow.com/a/57103940
export type DOmit<T, K extends string> = T extends unknown
  ? Omit<T, K>
  : never;

export type CleanupFunc = () => void;

export function Cleanups(...cleanups: CleanupFunc[]): CleanupFunc {
    return () => {
        cleanups.forEach((c) => c());
    };
}
