import {DigitalCircuitDesigner, DigitalComponent} from "digital/models";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";


type BaseLogiclyObject<type extends string> = {
    type: `${type}@logic.ly`;
    uid: string;
    x: number;
    y: number;
    rotation: number;
    exportName?: string;
}

type LogiclyGateTypes = "not" | "and" | "or";
type GateLogiclyObject = BaseLogiclyObject<LogiclyGateTypes> & {
    type: `${LogiclyGateTypes}@logic.ly`;
    inputs: number;
}
type LabelLogiclyObject = BaseLogiclyObject<"label"> & {
    text: string;
}
type ClockLogiclyObject = BaseLogiclyObject<"clock"> & {
    frequency: number;
}

type LogiclyConnection = {
    inputUID: string;
    inputIndex: number;

    outputUID: string;
    outputIndex: number;
}

type LogiclyObject =
    GateLogiclyObject |
    LabelLogiclyObject |
    ClockLogiclyObject |
    BaseLogiclyObject<"switch" | "light_bulb">;

const ObjMap: Map<LogiclyObject["type"], string> = new Map([
    ["not@logic.ly", "NOTGate"],
    ["and@logic.ly", "ANDGate"],
    ["or@logic.ly", "ORGate"],
    ["label@logic.ly", "Label"],
    ["clock@logic.ly", "Clock"],
    ["switch@logic.ly", "Switch"],
    ["light_bulb@logic.ly", "LED"],
]);

function fixObj(obj: Record<string, string>): LogiclyObject | undefined {
    const keys = ["type", "uid", "x", "y", "rotation"];
    if (!keys.every(key => (key in obj)))
        return;

    const floatKeys = ["x", "y", "rotation"] as const;
    const intKeys = ["inputs", "frequency"] as const;

    let fixedObj = {...obj} as Record<string, any>;

    floatKeys.forEach(key => {
        if (fixedObj[key]) fixedObj[key] = parseFloat(fixedObj[key]);
    });
    intKeys.forEach(key => {
        if (fixedObj[key]) fixedObj[key] = parseInt(fixedObj[key]);
    });

    return fixedObj as LogiclyObject;
}

function getObj(lObj: LogiclyObject): DigitalComponent {
    const obj = ObjMap.get(lObj.type);

    return obj;
}

export function LoadLogiclyCircuit(data: string, {}: DigitalCircuitInfo) {
    console.log(data);

    // It is necessary to remove the `;base64,` prefix before using atob
    data = atob(data.split(";base64,")[1]);

    const xml = new DOMParser().parseFromString(data, "application/xml") as XMLDocument;

    console.log(xml);

    const circuit = new DigitalCircuitDesigner();

    const objs = new Map<string, DigitalComponent>();
    for (const obj of xml.getElementsByTagName("object")) {
        console.log(obj);
        console.log(obj.getAttributeNames());
        // console.log(obj.getAttribute())
        const data = Object.fromEntries(obj.getAttributeNames().map(n => ([n, obj.getAttribute(n)])));
        const lObj = fixObj(data);
        if (!lObj)
            throw new Error("Invalid object for Logicly parser! " + xml);

        const ocObj = getObj(lObj);
        objs.set(lObj.uid, ocObj);
        circuit.addObject(ocObj);
    }
}
