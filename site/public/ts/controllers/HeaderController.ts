import {CircuitDesigner} from "../models/CircuitDesigner";

import {Importer} from "../utils/io/Importer";
import {Exporter} from "../utils/io/Exporter";

export var HeaderController = (function() {
    let mainDesigner: CircuitDesigner;

    let projectNameInput = <HTMLInputElement>document.getElementById("header-project-name-input");

    let fileInput = <HTMLInputElement>document.getElementById("header-file-input");

    let downloadDropdownButton = document.getElementById("header-download-dropdown-button");
    let downloadDropdown = document.getElementById("header-download-dropdown-content");

    let downloadButton = document.getElementById("header-download-button");
    let downloadPDFButton = document.getElementById("header-download-pdf-button");
    let downloadPNGButton = document.getElementById("header-download-png-button");

    return {
        Init: function(designer: CircuitDesigner) {
            mainDesigner = designer;

            // Show/hide the dropdown on click
            downloadDropdownButton.onclick = () => {
                // Toggle a class to keep :hover behavior
                downloadDropdown.classList.toggle("show");
                downloadDropdownButton.classList.toggle("white");
            }

            // Hide dropdown on click anywhere else
            window.onclick = (e) => {
                let target: Element = (e.target || e.srcElement) as Element;
                let dropdownParent = target.closest(".header__dropdown");
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

            fileInput.onchange = () => Importer.loadFile(mainDesigner, fileInput.files[0]);

            downloadButton.onclick = () => Exporter.saveFile(mainDesigner, projectNameInput.value);

            downloadPDFButton.onclick = () => {

            }

            downloadPNGButton.onclick = () => {

            }
        }
    }

})();
