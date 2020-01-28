import $ from "jquery";
import {ItemNavItem} from "./ItemNavItem";
import {ItemNavSection} from "./ItemNavSection";

export class ItemNav {
    private itemNav: JQuery<HTMLElement>;
    private sections: ItemNavSection[];

    public constructor(id: string) {
        this.itemNav = $("#" + id);
        this.sections = [];

        // Set on-clicks for each item
        const children = Array.from(this.itemNav.children());
        for (const child of children) {
            // If header, then move to next section
            if (child instanceof HTMLHeadingElement) {
                this.sections.push(new ItemNavSection($(child)));
                continue;
            }
            // Now only get button children (there shouldn't be any type)
            if (!(child instanceof HTMLButtonElement))
                continue;

            const section = this.sections[this.sections.length - 1];
            section.addItem(new ItemNavItem($(child)));
        }
    }

    public addSection(section: ItemNavSection): void {
        this.sections.push(section);
    }

    public getSections(): ItemNavSection[] {
        return this.sections.slice();
    }

}