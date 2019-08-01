import $ from "jquery";

import {CircuitDesigner} from "../models/CircuitDesigner";

import {Importer} from "../utils/io/Importer";
import {Exporter} from "../utils/io/Exporter";

import {MainDesignerController} from "./MainDesignerController";

export const HeaderController = (() => {
    const projectNameInput = $("input#header-project-name-input");

    const fileInput = $("input#header-file-input");

    const downloadButton = $("header-download-button");
    const downloadPDFButton = $("header-download-pdf-button");
    const downloadPNGButton = $("header-download-png-button");

    const helpButton = $("header-help-button");

    return {
        Init: function(designer: CircuitDesigner): void {
            const mainDesigner: CircuitDesigner = designer;

            // Show/hide the dropdown(s) on click
            $(".header__right__dropdown__button").click(function() {
                // Hide any other dropdowns first
                $(".header__right__dropdown__content").removeClass("show");
                $(".header__right__dropdown__button").removeClass("white");

                $(this).toggleClass("white");
                $(this).siblings(".header__right__dropdown__content")
                        .toggleClass("show");
            });

            // Hide dropdown(s) on click anywhere else
            window.onclick = (e) => {
                const target: Element = (e.target || e.srcElement) as Element;
                const dropdownParent = target.closest(".header__right__dropdown");
                if (!dropdownParent) {
                    $(".header__right__dropdown__content").removeClass("show");
                    $(".header__right__dropdown__button").removeClass("white");
                }
            }

            fileInput.change(() => {
                Importer.loadFile(mainDesigner, fileInput.prop("files")[0], (n) => {
                    if (n) projectNameInput.val(n);
                });
            });

            downloadButton.click(() => {
                Exporter.saveFile(mainDesigner, projectNameInput.val() as string);
            });

            downloadPDFButton.click(() => {
                Exporter.savePDF(MainDesignerController.GetCanvas(), projectNameInput.val() as string);
            });

            downloadPNGButton.click(() => {
                Exporter.savePNG(MainDesignerController.GetCanvas(), projectNameInput.val() as string);
            });

            // helpButton.onclick = () => {
            //
            // }
        }
    }

})();
