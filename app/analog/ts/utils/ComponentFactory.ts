import {EEComponent} from "../models/eeobjects/EEComponent";

import {Battery}       from "../models/eeobjects/Battery";
import {CurrentSource} from "../models/eeobjects/CurrentSource";
import {Resistor}      from "../models/eeobjects/Resistor";
import {Node}          from "../models/eeobjects/Node";

const OBJECTS = [Battery, CurrentSource, Resistor, Node];

let XML_COMPONENTS = new Map<string, any>();
let XML_NAMES = new Map<any, string>();

// Helper to add a bunch of types to the COMPONENTS map
function addXMLTypes(types: Array<any>): Array<string> {
    let arr = [];
    for (let type of types) {
        const name = new type().getXMLName();
        XML_COMPONENTS.set(name, type);
        XML_NAMES.set(type, name);
        arr.push(name);
    }
    return arr;
}

const XML_OBJECTS = addXMLTypes(OBJECTS);

/**
 * Helper method that creates an object from the
 *  given XML tag
 *
 * @param  val [description]
 * @return     [description]
 */
export function CreateComponentFromXML(tag: string, not: boolean = false): EEComponent {
    if (XML_COMPONENTS.has(tag)) {
        let type = XML_COMPONENTS.get(tag);
        return <EEComponent>(new type(not));
    }
    return undefined;
}

export function GetXMLName(type: any): string {
    return XML_NAMES.get(type);
}

export function GetAllComponentXMLNames() {
    return XML_OBJECTS.slice();
}

export function GetAllComponentTypes() {
    return OBJECTS.slice();
}
