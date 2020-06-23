import $ from "jquery";

import {OVERWRITE_CIRCUIT_MESSAGE} from "site/shared/utils/Constants";
import {SAVED} from "core/utils/Config";

import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {SavePDF, SavePNG} from "site/shared/utils/ImageExporter";
import {LoadFile} from "site/shared/utils/Importer";
import {SaveFile} from "../utils/Exporter";

export class HeaderController {
    protected projectNameInput: JQuery<HTMLElement> = $("input#header-project-name-input");

    public constructor(main: MainDesignerController) {
        this.setupDropdown();
        this.setupIOInputs(main);
        this.setupHelpMenu();
        this.setupOther(main);
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
            header.onLoadCircuit(main, $(this).prop("files")[0]);
        });

        $("#header-download-button").click(() => {
            this.onSaveCircuit(main);
        });

        $("#header-download-pdf-button").click(() => {
            SavePDF(main.getCanvas(), this.projectNameInput.val() as string);
        });

        $("#header-download-png-button").click(() => {
            SavePNG(main.getCanvas(), this.projectNameInput.val() as string);
        });
    }

    private setupHelpMenu(): void {
        $("#header-help-tour-button").click(() => {
            // TODO: Tutorial
        });

        $("#header-help-quick-start-button").click(() => {
            this.closeDropdowns();
            $("#quick-start-popup").removeClass("invisible");
            $("#overlay").removeClass("invisible");
        });

        this.setupKeyboardShortcutsMenu();

        $("#overlay").click(() => {
            $("#quick-start-popup").addClass("invisible");
            $("#keyboard-shortcuts-popup").addClass("invisible");
            $("#overlay").addClass("invisible");
        });
    }

    private setupKeyboardShortcutsMenu(): void {
        function toggleWindows(): void {
            $("#header-help-shortcuts-mac-option").removeClass("selected");
            $("#header-help-shortcuts-win-option").addClass("selected");

            $(".keyboardshortcuts__popup__toggle__win").removeClass("hide");
            $(".keyboardshortcuts__popup__toggle__mac").addClass("hide");
        }
        function toggleMac(): void {
            $("#header-help-shortcuts-win-option").removeClass("selected");
            $("#header-help-shortcuts-mac-option").addClass("selected");

            $(".keyboardshortcuts__popup__toggle__mac").removeClass("hide");
            $(".keyboardshortcuts__popup__toggle__win").addClass("hide");
        }

        // Check if platform is Mac and set mac as selected if true
        if (navigator.platform.indexOf("Mac") > -1)
            toggleMac();

        $("#header-help-shortcuts-button").click(() => {
            this.closeDropdowns();
            $("#keyboard-shortcuts-popup").removeClass("invisible");
            $("#overlay").removeClass("invisible");

            $("#header-help-shortcuts-win-option").click(toggleWindows);
            $("#header-help-shortcuts-mac-option").click(toggleMac);
        });
    }

    private closeDropdowns(): void {
        $(".header__right__dropdown__content")
                .removeClass("show");
        $(".header__right__dropdown__button")
                .removeClass("white");
    }

    private setupOther(main: MainDesignerController): void {
        $("#header-lock-button").click(() => {
            $("#header-lock-icon-unlocked").toggleClass("hide");
            $("#header-lock-icon-locked").toggleClass("hide");

            main.setLocked(!main.isLocked());
        });
    }

    protected async onLoadCircuit(main: MainDesignerController, file: File): Promise<void> {
        // Prompt to load
        const open = SAVED || confirm(OVERWRITE_CIRCUIT_MESSAGE);
        if (!open)
            return;

        // Load circuit and metadata
        const metadata = main.loadCircuit(await LoadFile(file));

        this.setProjectName(metadata.getName());
    }

    protected onSaveCircuit(main: MainDesignerController): void {
        SaveFile(main.saveCircuit(false), this.getProjectName());
    }

    public setProjectName(name?: string): void {
        if (name)
            this.projectNameInput.val(name);
    }

    public getProjectName(): string {
        return this.projectNameInput.val() as string;
    }
}
