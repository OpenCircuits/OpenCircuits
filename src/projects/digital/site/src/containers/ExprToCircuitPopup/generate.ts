import {V} from "Vector";
import {DigitalCircuit} from "digital/api/circuit/public";
import {ExpressionToCircuit} from "digital/site/utils/ExpressionParser"
import {GenerateTokens} from "digital/site/utils/ExpressionParser/GenerateTokens"
import {OrganizeMinDepth} from "digital/site/utils/ExpressionParser/ComponentOrganizer"
import {OperatorFormatLabel, OperatorFormat} from "digital/site/utils/ExpressionParser/Constants/DataStructures";
import {FORMATS} from "digital/site/utils/ExpressionParser/Constants/Formats";
import {Circuit} from "shared/api/circuit/public";
import {Err, Ok, Result} from "shared/api/circuit/utils/Result";
import {Viewport} from "shared/api/circuitdesigner/public/Viewport";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";


export type ExprToCirGeneratorOptions = {
    input: InputTypes;
    output: OutputTypes;
    isIC: boolean;
    connectClocksToOscope: boolean;
    label: boolean;
    format: OperatorFormatLabel;
    ops: OperatorFormat;
}

export type InputTypes = "Button" | "Clock" | "Switch";
export type OutputTypes = "Oscilloscope" | "LED";

const defaultOptions: ExprToCirGeneratorOptions = {
    input:                 "Switch",
    output:                "LED",
    isIC:                  false,
    connectClocksToOscope: false,
    label:                 false,
    format:                "|",
    ops:                   FORMATS[0],
}


function addLabels(inputMap: Map<string, string>, circuit: Circuit) {
    // Add labels next to inputs
    // TODO: This will have to be redone when there is a better organization algorithm
    for (const name of inputMap.keys()) {
        const newLabel = circuit.placeComponentAt("Label", V(0, 0));
        // All handled internally, component shouldn't be undefined
        const component = circuit.getComponents().find((comp) => comp.name === name)!;
        newLabel.pos = component!.pos.sub(2 * newLabel.bounds.width, 0);
        newLabel.name = name;
    }
}

function setClocks(inputMap: Map<string, string>, options: ExprToCirGeneratorOptions,
    circuit: Circuit) {
    let inIndex = 0;
    // Set clock frequencies
    for (const name of inputMap.keys()) {
        const clock = circuit.getComponents().find((comp) => comp.name === name);
        clock?.setProp("delay", 500 * (2 ** inIndex));
        inIndex = Math.min(inIndex + 1, 4);
    }
    // TODO[model_refactor](trevor): Revisit when oscilloscopes implemented
    // New version will query to output oscilloscope
    // Connect clocks to oscilloscope
    // if (options.connectClocksToOscope) {
    //     inIndex = 0;
    //     action.add(SetInputPortCount(o, Math.min(inputMap.size + 1, 6)));
    //     for (const clock of inputMap.values()) {
    //         action.add(Connect(designer, clock.getOutputPort(0), o.getInputPort(inIndex + 1)));
    //         inIndex++;
    //         if (inIndex === 5)
    //             break;
    //     }
    // }
}

// function handleIC(action: GroupAction, circuitComponents: DigitalComponent[], expression: string,
//                   info: DigitalCircuitInfo) {
//     const data = ICData.Create(circuitComponents);
//     if (!data)
//         throw new Error("Failed to create ICData");
//     data.setName(expression);
//     const ic = new IC(data);
//     action.add(SetName(ic, expression));
//     action.add(AddICData(data, info.designer));
//     action.add(DeleteGroup(info.designer, circuitComponents));
//     action.add(Place(info.designer, ic));
//     action.add(Translate([ic], [info.camera.getPos()]));
//     action.add(Select(info.selections, ic));
// }

export function Generate(circuit: DigitalCircuit, viewport: Viewport, expression: string,
    userOptions: Partial<ExprToCirGeneratorOptions>): Result {
    const options = {...defaultOptions, ...userOptions};
    options.isIC = (options.output !== "Oscilloscope") ? options.isIC : false;
    const ops = (options.format === "custom")
        ? (options.ops)
        : (FORMATS.find((form) => form.icon === options.format) ?? FORMATS[0]);

    const tokenList = GenerateTokens(expression, ops);
    if (!tokenList.ok) {
        return Err(tokenList.error);
    }
    // Maps input name as key, input component type as value
    const inputMap = new Map<string, InputTypes>();
    for (const token of tokenList.value) {
        if (token.type !== "input" || inputMap.has(token.name))
            continue;
        inputMap.set(token.name, options.input);
    }

    const generatedCircuitRes = ExpressionToCircuit(inputMap, expression, options.output, ops);
    if (!generatedCircuitRes.ok) {
        return Err(generatedCircuitRes.error);
    }

    const generatedCircuit = generatedCircuitRes.value;
    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    // const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    // TODO: Replace with a better (action based) way of organizing a circuit
    OrganizeMinDepth(generatedCircuit, viewport.camera.pos);

    if (options.label)
        addLabels(inputMap, generatedCircuit);

    if (options.input === "Clock")
        setClocks(inputMap, options, generatedCircuit);

        console.log(generatedCircuit.getWires());

    // TODO[model_refactor](trevor): Actually add when there is a way to add
    if (options.isIC) {
        // TODO: Add as IC
    } else {
        // TODO: Move the big copy into the api
        circuit.beginTransaction();
        const generatedToReal = new Map<string, DigitalComponent>();
        generatedCircuit.getComponents().forEach((comp) => {
            const newComp = circuit.placeComponentAt(comp.kind, comp.pos);
            generatedToReal.set(comp.id, newComp);
            if ("inputs" in comp.ports) {
                newComp.setNumPorts("inputs", comp.ports["inputs"].length);
            }
            if ("outputs" in comp.ports) {
                newComp.setNumPorts("outputs", comp.ports["outputs"].length);
            }
            Object.entries(comp.getProps()).forEach((prop) => newComp.setProp(...prop));
        });
        generatedCircuit.getWires().forEach((wire) => {
            const newPort1 = generatedToReal.get(wire.p1.parent.id)!.ports[wire.p1.group][wire.p1.index];
            const newPort2 = generatedToReal.get(wire.p2.parent.id)!.ports[wire.p2.group][wire.p2.index];
            const newWire = newPort1.connectTo(newPort2)!;
            Object.entries(wire.getProps()).forEach((prop) => newWire.setProp(...prop));
        });
        Array.from(generatedToReal.values()).forEach((comp) => comp.select);
        circuit.commitTransaction();
    }

    return Ok(undefined);
}
