export let SAVED = true;
export function setSAVED(b:boolean): void {SAVED = b;}

export let LABEL = true;
export function setLABEL(b:boolean): void {LABEL = b;}

// used in CopyController.ts
export let CLIPBOARD = "";
export function setCLIPBOARD(s:string): void {CLIPBOARD = s;}
