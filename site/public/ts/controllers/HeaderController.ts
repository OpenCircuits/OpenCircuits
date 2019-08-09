import $ from "jquery";

// import introJs from "intro.js";
//
// import test from "./tours/test.json";

import {Importer} from "../utils/io/Importer";
import {Exporter} from "../utils/io/Exporter";

import {MainDesignerController} from "./MainDesignerController";

export const HeaderController = (() => {
    const projectNameInput = $("input#header-project-name-input");

    function CloseDropdowns(): void {
        $(".header__right__dropdown__content")
                .removeClass("show");
        $(".header__right__dropdown__button")
                .removeClass("white");
    }

    function SetupDropdown(): void {
        // Show/hide the dropdown(s) on click
        $(".header__right__dropdown__button").click(function() {
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

    function SetupIOInputs(): void {
        $("input#header-file-input").change(function() {
            Importer.loadFile(MainDesignerController.GetDesigner(), $(this).prop("files")[0], (n) => {
                if (n) projectNameInput.val(n);
            });
        });

        $("#header-download-button").click(() => {
            Exporter.saveFile(MainDesignerController.GetDesigner(), projectNameInput.val() as string);
        });

        $("#header-download-pdf-button").click(() => {
            Exporter.savePDF(MainDesignerController.GetCanvas(), projectNameInput.val() as string);
        });

        $("#header-download-png-button").click(() => {
            Exporter.savePNG(MainDesignerController.GetCanvas(), projectNameInput.val() as string);
        });
    }

    function SetupHelpMenu(): void {
        $("#header-help-tour-button").click(() => {
            // // Open ItemNav for tutorial
            // if (!ItemNavController.IsOpen())
            //     ItemNavController.Toggle();
            //
            // introJs().setOptions(test).start();
        });

        $("#header-help-quick-start-button").click(() => {
            CloseDropdowns();
            $("#quick-start-popup").removeClass("invisible");
            $("#overlay").removeClass("invisible");
        });

        $("#overlay").click(() => {
            $("#quick-start-popup").addClass("invisible");
            $("#overlay").addClass("invisible");
        })
    }

    return {
        async Init(): Promise<void> {
            SetupDropdown();
            SetupIOInputs();
            SetupHelpMenu();
        }
    }

})();
