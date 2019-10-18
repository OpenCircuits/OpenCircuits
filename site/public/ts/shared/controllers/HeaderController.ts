import $ from "jquery";

// import introJs from "intro.js";
//
// import test from "./tours/test.json";

import {Exporter} from "core/utils/io/Exporter";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";

export abstract class HeaderController {
    protected projectNameInput: JQuery<HTMLElement>;

    public constructor(main: MainDesignerController) {
        this.projectNameInput = $("input#header-project-name-input");

        this.setupDropdown();
        this.setupIOInputs(main);
        this.setupHelpMenu();
    }

    private setupDropdown(): void {
        // Show/hide the dropdown(s) on click
        $(".header__right__dropdown__button").click(function(): void {
            // Hide all other dropdowns first
            $(".header__right__dropdown__content")
                    .not($(this).siblings(".header__right__dropdown__content"))
                    .removeClass("show");
            $(".header__right__dropdown__button")
                    .not($(this))
                    .removeClass("white");

            $(this).toggleClass("white");
            $(this).siblings(".header__right__dropdown__content")
                    .toggleClass("show");
        });

        // Hide dropdown(s) on click anywhere else
        $(window).click((e) => {
            const dropdownParent = $(e.target).parents(".header__right__dropdown");
            if (dropdownParent.length == 0) {
                $(".header__right__dropdown__content").removeClass("show");
                $(".header__right__dropdown__button").removeClass("white");
            }
        });
    }

    private setupIOInputs(main: MainDesignerController): void {
        const header = this;

        $("input#header-file-input").change(async function(): Promise<void> {
            header.setProjectName(await header.onLoadCircuit(main, $(this).prop("files")[0]));
        });

        $("#header-download-button").click(() => {
            this.onSaveCircuit(main);
        });

        $("#header-download-pdf-button").click(() => {
            Exporter.SavePDF(main.getCanvas(), this.projectNameInput.val() as string);
        });

        $("#header-download-png-button").click(() => {
            Exporter.SavePNG(main.getCanvas(), this.projectNameInput.val() as string);
        });
    }

    private setupHelpMenu(): void {
        $("#header-help-tour-button").click(() => {
            // // Open ItemNav for tutorial
            // if (!ItemNavController.IsOpen())
            //     ItemNavController.Toggle();
            //
            // introJs().setOptions(test).start();
        });

        $("#header-help-quick-start-button").click(() => {
            this.closeDropdowns();
            $("#quick-start-popup").removeClass("invisible");
            $("#overlay").removeClass("invisible");
        });

        $("#overlay").click(() => {
            $("#quick-start-popup").addClass("invisible");
            $("#overlay").addClass("invisible");
        })
    }

    private closeDropdowns(): void {
        $(".header__right__dropdown__content")
                .removeClass("show");
        $(".header__right__dropdown__button")
                .removeClass("white");
    }

    protected async abstract onLoadCircuit(main: MainDesignerController, file: File): Promise<string>;
    protected abstract onSaveCircuit(main: MainDesignerController): void;

    public setProjectName(name?: string): void {
        if (name)
            this.projectNameInput.val(name);
    }

    public getProjectName(): string {
        return this.projectNameInput.val() as string;
    }
}
