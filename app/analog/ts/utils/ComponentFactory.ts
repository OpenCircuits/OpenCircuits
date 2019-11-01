import {AnalogComponent} from "analog/models/AnalogComponent";

import {Battery}       from "analog/models/eeobjects/Battery";
import {CurrentSource} from "analog/models/eeobjects/CurrentSource";
import {Resistor}      from "analog/models/eeobjects/Resistor";
import {AnalogNode}    from "analog/models/eeobjects/AnalogNode";

const OBJECTS = [Battery, CurrentSource, Resistor, AnalogNode];

const XML_COMPONENTS = new Map<string, new (...args: unknown[]) => AnalogComponent>();
const XML_NAMES = new Map<new (...args: unknown[]) => AnalogComponent, string>();

// Helper to add a bunch of types to the COMPONENTS map
function addXMLTypes(types: Array<new () => AnalogComponent>): string[] {
    const arr = [];
    for (const type of types) {
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
export function CreateComponentFromXML(tag: string, not: boolean = false): AnalogComponent {
    if (XML_COMPONENTS.has(tag)) {
        const type = XML_COMPONENTS.get(tag);
        return new type(not);
    }
    return undefined;
}

export function GetXMLName(type: new (...args: unknown[]) => AnalogComponent): string {
    return XML_NAMES.get(type);
}

export function GetAllComponentXMLNames(): string[] {
    return XML_OBJECTS.slice();
}
