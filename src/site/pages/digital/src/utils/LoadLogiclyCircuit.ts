import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {IOObject} from "core/models";
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

type LogiclyGateTypes = "not" | "and" | "or";
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
    | BaseLogiclyObject<"switch" | "light_bulb", "other">
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

    return fixedObj as LogiclyObject;
}

function getObj(lObj: LogiclyObject, objsMap: Map<LogiclyObject["type"], string>, icsMap: Map<string, ICData>): DigitalComponent {
    const uuid = objsMap.get(lObj.type);
    if (!uuid)
        throw new Error(`Failed to find Object of type: ${uuid}!`);
    const obj = Create<DigitalComponent>(uuid);
    if (!obj)
        throw new Error(`Failed to create digital component with ID: ${uuid}!`);

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
        case "ic":
            (obj as IC)["data"] = icsMap.get(lObj.type);
            (obj as IC)["redirectOutputs"]();
            break;
    }

    return obj;
}

function LoadRawLogiclyCircuit(xml: Element|XMLDocument, ObjMap: Map<LogiclyObject["type"], string>, icsMap: Map<string, ICData>) {
    const circuit = new DigitalCircuitDesigner();

    const objs = new Map<string, DigitalComponent>();
    for (const obj of xml.getElementsByTagName("object")) {
        const data = Object.fromEntries(obj.getAttributeNames().map(n => ([n, obj.getAttribute(n)])));
        const lObj = fixObj(data);
        if (!lObj)
            throw new Error("Invalid object for Logicly parser! " + obj);

        const ocObj = getObj(lObj, ObjMap, icsMap);
        objs.set(lObj.uid, ocObj);
        circuit.addObject(ocObj);
    }

    for (const con of xml.getElementsByTagName("connection")) {
        const data = Object.fromEntries(con.getAttributeNames().map(n => ([n, con.getAttribute(n)])));
        const lConnection = fixConnection(data);
        if (!lConnection)
            throw new Error("Invalid connection for Logicly parser! " + con);

        const inputObj = objs.get(lConnection.inputUID);
        if (!inputObj)
            throw new Error(`Failed to find connection input w/ UID: ${lConnection.inputUID}, from list: ${objs}`);
        const outputObj = objs.get(lConnection.outputUID);
        if (!outputObj)
            throw new Error(`Failed to find connection output w/ UID: ${lConnection.outputUID}, from list: ${objs}`);

        new ConnectionAction(circuit,
            inputObj.getInputPort(lConnection.inputIndex),
            outputObj.getOutputPort(lConnection.outputIndex)
        ).execute();
    }

    return circuit;
}

export function LoadLogiclyCircuit(data: string, {designer, selections, history, renderer}: DigitalCircuitInfo) {
    // Initial object map, ICs get added to it later
    const ObjMap: Map<LogiclyObject["type"], string> = new Map([
        ["not@logic.ly", "NOTGate"],
        ["and@logic.ly", "ANDGate"],
        ["or@logic.ly", "ORGate"],
        ["label@logic.ly", "Label"],
        ["clock@logic.ly", "Clock"],
        ["switch@logic.ly", "Switch"],
        ["light_bulb@logic.ly", "LED"],
    ]);

    // It is necessary to remove the `;base64,` prefix before using atob
    data = atob(data.split(";base64,")[1]);

    const xml = new DOMParser().parseFromString(data, "application/xml") as XMLDocument;

    console.log(xml);



    // Find and create all the ICs
    const icMap = new Map<string, ICData>();
    for (const custom of xml.getElementsByName("custom")) {
        const customLogicly = Array.from(custom.getElementsByTagName("logicly"))[0];
        const icName = customLogicly.getAttribute("name");
        const icUID = customLogicly.getAttribute("type") as UID;

        // Parse IC sub-circuit
        const subCircuit = LoadRawLogiclyCircuit(customLogicly, ObjMap, icMap);
        const data = ICData.Create(subCircuit.getAll());
        data.setName(icName);

        // // Get port locations
        // const locations = Array.from(customLogicly.getElementsByTagName("location"));
        // const rightLocs = locations.find(loc => loc.getAttribute("id") === "right");
        // const leftLocs  = locations.find(loc => loc.getAttribute("id") === "left");

        icMap.set(icUID, data);
        ObjMap.set(icUID, "IC");
    }



    const circuit = LoadRawLogiclyCircuit(xml, ObjMap, icMap);


    // Reset selections, clear history, and replace circuit
    selections.get().forEach(s => selections.deselect(s));

    history.reset();

    designer.replace(circuit);

    renderer.render();
}
