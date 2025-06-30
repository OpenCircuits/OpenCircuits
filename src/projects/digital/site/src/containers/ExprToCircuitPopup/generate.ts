import {V} from "Vector";
import {Camera} from "shared/api/circuit/public/Camera";
import {DigitalCircuit} from "digital/api/circuit/public";
import {ExpressionToCircuit} from "digital/site/utils/ExpressionParser"
import {GenerateTokens} from "digital/site/utils/ExpressionParser/GenerateTokens"
import {OrganizeMinDepth} from "digital/site/utils/ExpressionParser/ComponentOrganizer"
import {OperatorFormat, OperatorFormatLabel} from "digital/site/utils/ExpressionParser/Constants/DataStructures";
import {FORMATS} from "digital/site/utils/ExpressionParser/Constants/Formats";
import {Circuit, ICPin} from "shared/api/circuit/public";
import {Err, Ok, Result} from "shared/api/circuit/utils/Result";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";
import {CalculateICDisplay} from "digital/site/utils/CircuitUtils";


export type ExprToCirGeneratorOptions = {
    input: InputTypes;
    output: OutputTypes;
    isIC: boolean;
    connectClocksToOscope: boolean;
    label: boolean;
    format: OperatorFormatLabel;
    ops: OperatorFormat;
}

export type InputTypes = "Button" | "Clock" | "Switch" | "InputPin";
export type OutputTypes = "Oscilloscope" | "LED" | "OutputPin";

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
    circuit: DigitalCircuit) {
    let inIndex = 0;
    // Set clock frequencies
    for (const name of inputMap.keys()) {
        const clock = circuit.getComponents().find((comp) => comp.name === name);
        clock?.setProp("delay", 4 * (2 ** (inIndex)));
        inIndex = Math.min(inIndex + 1, 7);
    }
    // Connect clocks to oscilloscope
    if (options.connectClocksToOscope) {
        const o = circuit.getComponents().find(({ kind }) => kind === "Oscilloscope")!;
        o.setPortConfig({ "inputs": Math.min(inputMap.size + 1, 8) });
        [...inputMap.keys()].forEach((name, inIndex) => {
            if (inIndex >= 7) // max 8 inputs and the first is reserved for circuit output
                return;
            const clock = circuit.getComponents().find((comp) => comp.name === name)!;
            clock.outputs[0].connectTo(o.inputs[inIndex + 1]);
        });
    }
}

export function Generate(circuit: DigitalCircuit, camera: Camera, expression: string,
    userOptions: Partial<ExprToCirGeneratorOptions>): Result {
    const options = { ...defaultOptions, ...userOptions };
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

    const { circuit: generatedCircuit } = generatedCircuitRes.value;
    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    // const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    // TODO: Replace with a better way of organizing a circuit
    OrganizeMinDepth(generatedCircuit, camera.pos);

    if (options.label)
        addLabels(inputMap, generatedCircuit);

    if (options.input === "Clock")
        setClocks(inputMap, options, generatedCircuit);

    circuit.beginTransaction();
    circuit.selections.clear();
    if (options.isIC) {
        const ic = circuit.createIC({
            circuit: generatedCircuit,
            display: CalculateICDisplay(generatedCircuit),
        })
        circuit.placeComponentAt(ic.id, camera.pos).select();
    } else {
        const generatedToReal = new Map<string, DigitalComponent>();
        generatedCircuit.getComponents().forEach((comp) => {
            const newComp = circuit.placeComponentAt(comp.kind, comp.pos);
            newComp.select();
            generatedToReal.set(comp.id, newComp);
            if ("inputs" in comp.ports) {
                newComp.setPortConfig({ "inputs": comp.ports["inputs"].length });
            }
            if ("outputs" in comp.ports) {
                newComp.setPortConfig({ "outputs": comp.ports["outputs"].length });
            }
            Object.entries(comp.getProps()).forEach((prop) => newComp.setProp(...prop));
        });
        generatedCircuit.getWires().forEach((wire) => {
            const newPort1 = generatedToReal.get(wire.p1.parent.id)!.ports[wire.p1.group][wire.p1.index];
            const newPort2 = generatedToReal.get(wire.p2.parent.id)!.ports[wire.p2.group][wire.p2.index];
            const newWire = newPort1.connectTo(newPort2)!;
            Object.entries(wire.getProps()).forEach((prop) => newWire.setProp(...prop));
        });
    }
    circuit.commitTransaction("Created Circuit From Expression");

    return Ok(undefined);
}
