import {ItemNavItem} from "./ItemNavItem";

export class ItemNavSection {
    private header: JQuery<HTMLHeadingElement>;
    private items: ItemNavItem[];

    public constructor(header: JQuery<HTMLHeadingElement>) {
        this.header = header;
        this.items = [];
    }

    public addItem(item: ItemNavItem): void {
        this.items.push(item);
    }

    public removeItems(): void {
        this.items.forEach((item) => item.remove());
        this.items = [];
    }

    public getHeader(): JQuery<HTMLHeadingElement> {
        return this.header;
    }

    public getItems(): ItemNavItem[] {
        return this.items.slice();
    }
}