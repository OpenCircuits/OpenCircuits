
export interface Pressable {
    press(): void;
    click(): void;
    release(): void;
}

export function IsPressable(obj: any): obj is Pressable {
    return obj &&
           obj.press !== undefined &&
           obj.click !== undefined &&
           obj.release !== undefined;
}