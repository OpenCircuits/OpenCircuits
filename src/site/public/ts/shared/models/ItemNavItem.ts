
export class ItemNavItem {
    private uuid: string;
    private el: JQuery<HTMLButtonElement>;

    public constructor(el: JQuery<HTMLButtonElement>) {
        this.uuid = el[0].dataset.uuid;
        this.el = el;
    }

    public remove(): void {
        this.el.remove();
    }

    public getUUID(): string {
        return this.uuid;
    }

    public getElement(): JQuery<HTMLButtonElement> {
        return this.el;
    }
}