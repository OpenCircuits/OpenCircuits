
export class ItemNavItem {
    private uuid: string;
    private el: HTMLButtonElement;

    public constructor(el: HTMLButtonElement) {
        this.uuid = el.dataset.uuid;
        this.el = el;
    }

    public getUUID(): string {
        return this.uuid;
    }

    public getElement(): HTMLButtonElement {
        return this.el;
    }
}