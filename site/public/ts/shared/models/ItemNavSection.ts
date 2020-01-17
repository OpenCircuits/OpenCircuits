import {ItemNavItem} from "./ItemNavItem";

export class ItemNavSection {
    private header: string;
    private items: ItemNavItem[];

    public constructor(header: string) {
        this.header = header;
        this.items = [];
    }

    public addItem(item: ItemNavItem): void {
        this.items.push(item);
    }

    public getHeader(): string {
        return this.header;
    }

    public getItems(): ItemNavItem[] {
        return this.items.slice();
    }
}