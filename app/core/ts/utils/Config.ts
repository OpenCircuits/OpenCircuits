const callbacks: Array<(val: boolean) => void> = [];

export let SAVED = true;

export function setSAVED(b: boolean): void {
    SAVED = b;
    callbacks.forEach((callback) => callback(b));
}
export function addSetSavedCallback(callback: (val: boolean) => void): void {
    callbacks.push(callback);
}
