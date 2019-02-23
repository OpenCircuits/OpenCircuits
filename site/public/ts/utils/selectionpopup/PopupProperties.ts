export class PopupProperty<T> {
    callbacks: Array<(obj: T) => void>;

    constructor() {
        this.callbacks = [];
    }

    set onchange(callback: (obj: T) => void) {
        this.callbacks.push(callback);
    }
    // No getter for onchange

    trigger(obj: T) {
        for (let c of this.callbacks) {
            c(obj);
        }
    }
}