import {CircuitMetadata} from "../models/CircuitMetadata";
import {Circuit} from "../models/Circuit";
import {Importer} from "../utils/io/Importer";
import {XMLWriter} from "../utils/io/xml/XMLWriter";
import {CircuitDesigner} from "../models/CircuitDesigner";

export const RemoteCircuitController = (() => {
    let circuitCache = new Array<string>();

    // Sort of a hack.  Keeps the blank circuit from being pushed to the remote
    const blankCircuit = new Circuit();
    blankCircuit.designer = new CircuitDesigner();
    circuitCache[-1] = XMLWriter.fromLable(blankCircuit).serialize();

    return {
        LoadCircuitList: () => new Promise<CircuitMetadata[]>((resolve, reject) => {
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
        LoadCircuit: function (circuit: Circuit, id: string): Promise<CircuitMetadata> {
            return new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', 'api/circuits/' + escape(id));
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        Importer.LoadCircuitXMLDocument(circuit, xhr.responseXML);
                        circuitCache[circuit.metadata.getId()] = xhr.responseText;
                        resolve(circuit.metadata);
                    } else {
                        reject(xhr.responseText);
                    }
                };
                xhr.send();
            })
        },
        PushCircuit: (circuit: Circuit) => new Promise((resolve, reject) => {
            const data = XMLWriter.fromLable(circuit).serialize();

            // don't hit the server if nothing changed
            let prevData = circuitCache[circuit.metadata.getId()];
            circuitCache[circuit.metadata.getId()] = data;
            if (prevData === data) {
                resolve(null);
                return;
            }

            const xhr = new XMLHttpRequest();

            if (circuit.metadata.getId() === -1)
                xhr.open('POST', 'api/circuits');
            else
                xhr.open('PUT', 'api/circuits/' + circuit.metadata.getId());
            xhr.onload = function () {
                if (xhr.status === 202) {
                    circuit.metadata = CircuitMetadata.parseXmlDocument(xhr.responseXML);
                    circuitCache[circuit.metadata.getId()] = XMLWriter.fromLable(circuit).serialize();
                    resolve();
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.setRequestHeader('Content-Type', 'application/xml');
            xhr.send(data);

        }),
    }
})();
