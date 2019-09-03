import $ from "jquery"

import {CircuitMetadata} from "../models/CircuitMetadata";

export class SideNavCircuitPreview {
    private metadata: CircuitMetadata;

    private element: JQuery<HTMLElement>;

    public constructor(metadata: CircuitMetadata) {
        this.metadata = metadata;

        this.build();
    }

    public remove(): void {
        this.element.remove();
    }

    private build(): void {
        const id = this.metadata.getId();
        const name = this.metadata.getName();
        const desc = this.metadata.getDesc();

        this.element = $("#user-circuit-list").append(`
            <div id="user-circuit-${id}" class="sidenav__content__circuit">
                <img src="./img/icon.svg">
                <div class="sidenav__content__circuit__text">
                    <span class="sidenav__content__circuit__text__name">${name}</span>
                    <span class="sidenav__content__circuit__text__desc">${desc}</span>
                </div>
            </div>
        `).children(":last-child");
    }
}
