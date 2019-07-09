import {CircuitDesigner} from "../models/CircuitDesigner";

import {Importer} from "../utils/io/Importer";
import {Exporter} from "../utils/io/Exporter";

import {MainDesignerController} from "./MainDesignerController";
import {Circuit} from "../models/Circuit";
import {CircuitMetadata} from "../models/CircuitMetadata";

export const HeaderController = (() => {
    const projectNameInput = <HTMLInputElement>document.getElementById("header-project-name-input");

    const fileInput = <HTMLInputElement>document.getElementById("header-file-input");

    const downloadDropdownButton = document.getElementById("header-download-dropdown-button");
    const downloadDropdown = document.getElementById("header-download-dropdown-content");

    const savingIndicator = document.getElementById("saving-indicator");

    const newButton = document.getElementById("header-new-button");
    const saveButton = document.getElementById("header-save-button");
    const loadButton = document.getElementById("header-load-button");
    const loadId = <HTMLInputElement>document.getElementById("header-load-id");
    const downloadButton = document.getElementById("header-download-button");
    const downloadPDFButton = document.getElementById("header-download-pdf-button");
    const downloadPNGButton = document.getElementById("header-download-png-button");

    const updateName = (n: string) => { if (n) projectNameInput.value = n; };

    const setSavingState = (s: boolean) => savingIndicator.hidden = !s;

    return {
        Init: function(circuit: Circuit): void {
            const mainCircuit: Circuit = circuit;

            // Show/hide the dropdown on click
            downloadDropdownButton.onclick = () => {
                // Toggle a class to keep :hover behavior
                downloadDropdown.classList.toggle("show");
                downloadDropdownButton.classList.toggle("white");
            }

            // Hide dropdown on click anywhere else
            window.onclick = (e) => {
                const target: Element = (e.target || e.srcElement) as Element;
                const dropdownParent = target.closest(".header__dropdown");
                if (!dropdownParent) {
                    if (downloadDropdown.classList.contains("show")) {
                        downloadDropdown.classList.toggle("show");
                        downloadDropdownButton.classList.toggle("white");
                    }
                    // let visible = (downloadDropdown.style.display == "block");
                    // if (visible) {
                    //     downloadDropdown.style.display = "none";
                    //     downloadDropdownButton.style.backgroundColor = "initial";//"rgba(0,0,0,0)";
                    // }
                }
            }

            projectNameInput.onchange = () => mainCircuit.metadata.setName(projectNameInput.value);
            fileInput.onchange = () => {
                Importer.loadFile(mainCircuit, fileInput.files[0]);
                updateName(mainCircuit.metadata.getName());
            };

            downloadButton.onclick = () => Exporter.saveFile(mainCircuit);

            newButton.onclick = () => {
                MainDesignerController.NewCircuit();
            };
            saveButton.onclick = () => {
                MainDesignerController.PushCircuit();
            };
            loadButton.onclick = () => {
                MainDesignerController.FetchCircuit(loadId.value);
            };

            downloadPDFButton.onclick = () => Exporter.savePDF(MainDesignerController.GetCanvas(), projectNameInput.value);

            downloadPNGButton.onclick = () => Exporter.savePNG(MainDesignerController.GetCanvas(), projectNameInput.value);
        },
        UpdateName: updateName,
        SavingInProgress: () => setSavingState(true),
        SavingComplete: () => setSavingState(false),
    }

})();
