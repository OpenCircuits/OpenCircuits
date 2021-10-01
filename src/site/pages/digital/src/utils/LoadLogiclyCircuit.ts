import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {MoveCameraAction} from "core/actions/camera/MoveCameraAction";
import {IOObject} from "core/models";
import {GetCameraFit} from "core/utils/ComponentUtils";
import {FIT_PADDING_RATIO} from "core/utils/Constants";
import {DigitalCircuitDesigner, DigitalComponent} from "digital/models";
import {Clock, IC, ICData} from "digital/models/ioobjects";
import {DigitalObjectSet} from "digital/utils/ComponentUtils";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {Create} from "serialeazy";
import {V} from "Vector";

type UID = `${string}-${string}-${string}-${string}-${string}`;

type BaseLogiclyProps = {
    uid: UID;
    x: number;
    y: number;
    rotation: number;
    exportName?: string;
}
type BaseLogiclyObject<type extends string, id extends string = type> = BaseLogiclyProps & {
    type: `${type}@logic.ly`;
    id: id;
}

type LogiclyGateTypes = "not" | "and" | "or" | "xor";
type GateLogiclyObject = BaseLogiclyObject<LogiclyGateTypes, "gate"> & {
    type: `${LogiclyGateTypes}@logic.ly`;
    inputs: number;
}
type LabelLogiclyObject = BaseLogiclyObject<"label"> & {
    text: string;
}
type ClockLogiclyObject = BaseLogiclyObject<"clock"> & {
    frequency: number;
}
type CustomLogiclyObject = BaseLogiclyProps & {
    id: "ic";
    type: UID;
}

type LogiclyConnection = {
    inputUID: string;
    inputIndex: number;

    outputUID: string;
    outputIndex: number;
}

type LogiclyObject =
    | GateLogiclyObject
    | LabelLogiclyObject
    | ClockLogiclyObject
    | BaseLogiclyObject<"switch" | "light_bulb" | "digit" | "constant_low" | "constant_high", "other">
    | CustomLogiclyObject;

function fixConnection(con: Record<string, string>): LogiclyConnection | undefined {
    const keys = ["inputUID", "inputIndex", "outputUID", "outputIndex"];
    if (!keys.every(key => (key in con)))
        return;

    const intKeys = ["inputIndex", "outputIndex"];

    let fixedCon = {...con} as Record<string, any>;

    intKeys.forEach(key => {
        if (fixedCon[key]) fixedCon[key] = parseInt(fixedCon[key]);
    });

    return fixedCon as LogiclyConnection;
}

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

    // fixedObj["id"] = // TODO
    if (fixedObj["type"].endsWith("@logic.ly")) {
        let id = "other";
        switch (fixedObj["type"].split("@logic.ly")[0]) {
            case "and":
            case "or":
            case "xor":
            case "not":
                id = "gate";
                break;
            case "label":
                id = "label";
                break;
            case "clock":
                id = "clock";
                break;
        }
        fixedObj["id"] = id;
    } else {
        // IC
        fixedObj["id"] = "ic";
    }

    fixedObj["x"] *= 2.5;
    fixedObj["y"] *= 1.5;

    return fixedObj as LogiclyObject;
}

function getObj(lObj: LogiclyObject, xml: XMLDocument, objsMap: Map<LogiclyObject["type"], string>, icsMap: Map<string, ICData>): DigitalComponent {
    let obj: DigitalComponent;
    if (objsMap.has(lObj.type)) {
        const uuid = objsMap.get(lObj.type);
        obj = Create<DigitalComponent>(uuid);
        if (!obj)
            throw new Error(`Failed to create digital component with ID: ${uuid}!`);
    } else {
        // IC
        const data = LoadCustomIC(lObj.type, xml, objsMap, icsMap);
        if (!data) {
            console.error(`Failed to find Object of type: ${lObj.type}!`);
            return undefined;
        }
        obj = new IC(data);
    }

    // Set base properties
    obj.setPos(V(lObj.x, lObj.y));
    obj.setAngle(lObj.rotation);
    if (lObj.exportName)
        obj.setName(lObj.exportName);

    // Set specific properties
    switch (lObj.id) {
        case "gate":
            obj.setInputPortCount(lObj.inputs);
            break;
        case "label":
            obj.setName(lObj.text);
            break;
        case "clock":
            (obj as Clock).setFrequency(lObj.frequency);
            break;
    }

    return obj;
}

function LoadRawLogiclyCircuit(xml: Element|XMLDocument, doc: XMLDocument, ObjMap: Map<LogiclyObject["type"], string>, icsMap: Map<string, ICData>) {
    const circuit = new DigitalCircuitDesigner();

    const objs = new Map<string, DigitalComponent>();
    for (const obj of xml.getElementsByTagName("object")) {
        const data = Object.fromEntries(obj.getAttributeNames().map(n => ([n, obj.getAttribute(n)])));
        const lObj = fixObj(data);
        if (!lObj)
            throw new Error("Invalid object for Logicly parser! " + obj);

        const ocObj = getObj(lObj, doc, ObjMap, icsMap);
        if (!ocObj)
            continue;
        objs.set(lObj.uid, ocObj);
        circuit.addObject(ocObj);
    }

    for (const con of xml.getElementsByTagName("connection")) {
        const data = Object.fromEntries(con.getAttributeNames().map(n => ([n, con.getAttribute(n)])));
        const lConnection = fixConnection(data);
        if (!lConnection)
            throw new Error("Invalid connection for Logicly parser! " + con);

        const inputObj = objs.get(lConnection.inputUID);
        if (!inputObj) {
            console.error(`Failed to find connection input w/ UID: ${lConnection.inputUID}, from list: ${objs}`);
            continue;
        }
        const outputObj = objs.get(lConnection.outputUID);
        if (!outputObj) {
            console.error(`Failed to find connection output w/ UID: ${lConnection.outputUID}, from list: ${objs}`);
            continue;
        }

        if (inputObj.getInputPort(lConnection.inputIndex).getInput()) {
            console.error("Attempted to connect to port that already had an input!", lConnection);
            continue;
        }
        new ConnectionAction(circuit,
            inputObj.getInputPort(lConnection.inputIndex),
            outputObj.getOutputPort(lConnection.outputIndex)
        ).execute();
    }

    return circuit;
}

function LoadCustomIC(type: string, xml: XMLDocument, ObjMap: Map<LogiclyObject["type"], string>, icsMap: Map<string, ICData>): ICData {
    if (icsMap.has(type))
        return icsMap.get(type);

    const customTags = Array.from(xml.getElementsByTagName("custom"));
    const custom = customTags.find(custom => custom.getAttribute("type") === type);
    if (!custom) {
        console.error(`Failed to find IC with type: ${type}`);
        return undefined;
    }

    const customLogicly = Array.from(custom.getElementsByTagName("logicly"))[0];
    const icName = custom.getAttribute("name");
    const icUID = custom.getAttribute("type") as UID;

    // Parse IC sub-circuit
    const subCircuit = LoadRawLogiclyCircuit(customLogicly, xml, ObjMap, icsMap);
    const data = ICData.Create(subCircuit.getAll(), true);
    data.setName(icName);

    icsMap.set(icUID, data);

    return data;
}

export function LoadLogiclyCircuit(data: string, {camera, designer, selections, history, renderer}: DigitalCircuitInfo) {
    // Initial object map, ICs get added to it later
    const ObjMap: Map<LogiclyObject["type"], string> = new Map([
        ["not@logic.ly", "NOTGate"],
        ["and@logic.ly", "ANDGate"],
        ["xor@logic.ly", "XORGate"],
        ["or@logic.ly", "ORGate"],
        ["label@logic.ly", "Label"],
        ["clock@logic.ly", "Clock"],
        ["switch@logic.ly", "Switch"],
        ["constant_low@logic.ly", "ConstantLow"],
        ["constant_high@logic.ly", "ConstantHigh"],
        ["light_bulb@logic.ly", "LED"],
        ["digit@logic.ly", "BCDDisplay"],
    ]);

    // It is necessary to remove the `;base64,` prefix before using atob
    data = atob(data.split(";base64,")[1]);

    const xml = new DOMParser().parseFromString(data, "application/xml") as XMLDocument;

    console.log(xml);

    // Find and create all the ICs
    const icMap = new Map<string, ICData>();

    // Load rest of circuit
    const circuit = LoadRawLogiclyCircuit(xml, xml, ObjMap, icMap);

    // Add ICData to circuit
    icMap.forEach((ic) => circuit.addICData(ic));

    // Get final camera position and zoom
    const [pos, zoom] = GetCameraFit(camera, circuit.getObjects(), FIT_PADDING_RATIO);
    new MoveCameraAction(camera, pos, zoom).execute();

    // Reset selections, clear history, and replace circuit
    selections.get().forEach(s => selections.deselect(s));

    history.reset();

    designer.replace(circuit);

    renderer.render();
}
