import $ from "jquery"

import {CircuitMetadata} from "core/models/CircuitMetadata";

export class SideNavCircuitPreview {
    private metadata: CircuitMetadata;

    private element: JQuery<HTMLElement>;
    private deleteElement: JQuery<HTMLElement>;

    public constructor(metadata: CircuitMetadata) {
        this.metadata = metadata;

        this.build();
    }

    public remove(): void {
        this.element.remove();
    }

    public onClick(loadCallback: () => void, deleteCallback: () => void): void {
        this.element.click(loadCallback);
        this.deleteElement.click((e) => {
            deleteCallback();
            e.stopPropagation(); 
        });
    }

    private build(): void {
        const id = this.metadata.getId();
        const name = this.metadata.getName();
        const desc = this.metadata.getDesc();
        const thumbnail = this.metadata.getThumbnail();

        this.element = $("#user-circuit-list").append(`
            <div id="user-circuit-${id}" class="sidenav__content__circuit" title="Load circuit">
                <span class="sidenav__content__circuit__icon">
                    <img src="${thumbnail}">
                </span>
                <span class="sidenav__content__circuit__text">
                        <div class="sidenav__content__circuit__text__name">${name}</div>
                        <div class="sidenav__content__circuit__text__desc">${desc}</div>
                </span>
                <span class="sidenav__content__circuit__controls">
                    <img class="circuit_options" width="20px" src="img/icons/close-24px.svg" title="Delete Circuit">
                </span>
            </div>
        `).children(":last-child");
        this.deleteElement = this.element.find("img.circuit_options");
    }
}
