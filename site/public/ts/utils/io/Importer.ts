import {XMLReader} from "./xml/XMLReader";
import {Circuit} from "../../models/Circuit";
import {CircuitMetadata} from "../../models/CircuitMetadata";

export const Importer = (() => {

    const readString = function (circuit: Circuit, file: string): void {
        const root = <XMLDocument>new DOMParser().parseFromString(file, "text/xml");
        if (root.documentElement.nodeName == "parsererror")
            return;
        readDocument(circuit, root);
    };

    const readDocument = function (circuit: Circuit, doc: XMLDocument): void {
        const reader = new XMLReader(doc);

        // TODO: resolve this...
        // Check for old version of save
        // if (reader.getVersion() == -1)
        //     ResolveVersionConflict(reader);

        circuit.load(reader.getRoot());
    };

    return {
        // TODO (KevinMackenzie): We should reconsider how we organize the interface with the server
        loadCircuitList: () => new Promise<CircuitMetadata[]>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'api/circuits');
            xhr.onload = () => {
                if (xhr.status == 200) {
                    resolve(CircuitMetadata.parseMultipleXmlDocument(xhr.responseXML));
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.send();
        }),
        loadRemote: function (circuit: Circuit, id: string): Promise<CircuitMetadata> {
            // TOOD: only ask for confirmation if nothing was done to the scene
            //        ex. no objects, or wires, or history of actions
            let open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                return new Promise((resolve, reject) => {
                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', 'api/circuits/' + escape(id));
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            readDocument(circuit, xhr.responseXML);
                            resolve(circuit.metadata);
                        } else {
                            reject(xhr.responseText);
                        }
                    };
                    xhr.send();
                })
            }
            return Promise.resolve(undefined);
        },
        loadFile: function (circuit: Circuit, file: File): void {
            // TOOD: only ask for confirmation if nothing was done to the scene
            //        ex. no objects, or wires, or history of actions
            const open = confirm("Are you sure you want to overwrite your current scene?");

            if (open) {
                const reader = new FileReader();
                reader.onload = () => {
                    readString(circuit, reader.result.toString());
                };

                reader.readAsText(file);
            }
        }
    }

})();
