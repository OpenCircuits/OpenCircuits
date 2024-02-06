import {Create} from "serialeazy";

import {OperatorFormat,
        OperatorFormatLabel} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {FORMATS} from "digital/utils/ExpressionParser/Constants/Formats";

import {OrganizeMinDepth} from "core/utils/ComponentOrganizers";

import {GroupAction} from "core/actions/GroupAction";

import {AddGroup}    from "core/actions/compositions/AddGroup";
import {DeleteGroup} from "core/actions/compositions/DeleteGroup";

import {Connect}                          from "core/actions/units/Connect";
import {Place}                            from "core/actions/units/Place";
import {DeselectAll, Select, SelectGroup} from "core/actions/units/Select";
import {SetName}                          from "core/actions/units/SetName";
import {SetProperty}                      from "core/actions/units/SetProperty";
import {Translate}                        from "core/actions/units/Translate";

import {DigitalCircuitInfo}  from "digital/utils/DigitalCircuitInfo";
import {ExpressionToCircuit} from "digital/utils/ExpressionParser";

import {GenerateTokens} from "digital/utils/ExpressionParser/GenerateTokens";

import {AddICData}         from "digital/actions/units/AddICData";
import {SetInputPortCount} from "digital/actions/units/SetInputPortCount";

import {DigitalCircuitDesigner, DigitalComponent, DigitalObjectSet} from "digital/models";

import {Clock, IC, ICData, Label} from "digital/models/ioobjects";


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

function addLabels(inputMap: Map<string, DigitalComponent>, action: GroupAction,
    circuitComponents: DigitalComponent[], designer: DigitalCircuitDesigner) {
    // Add labels next to inputs
    // TODO: This will have to be redone when there is a better organization algorithm
    for (const [name, component] of inputMap) {
        const newLabel = Create<Label>("Label");
        const pos = component.getPos().sub(newLabel.getSize().x + component.getSize().x, 0);
        action.add(Place(designer, newLabel));
        action.add(SetName(newLabel, name));
        action.add(Translate([newLabel], [pos]));
        circuitComponents.push(newLabel);
    }
}

function setClocks(inputMap: Map<string, Clock>, action: GroupAction, options: ExprToCirGeneratorOptions,
    o: DigitalComponent, designer: DigitalCircuitDesigner) {
    let inIndex = 0;
    // Set clock frequencies
    for (const clock of inputMap.values()) {
        action.add(SetProperty(clock, "delay", 500 * (2 ** inIndex)));
        inIndex = Math.min(inIndex + 1, 4);
    }
    // Connect clocks to oscilloscope
    if (options.connectClocksToOscope) {
        inIndex = 0;
        action.add(SetInputPortCount(o, Math.min(inputMap.size + 1, 6)));
        for (const clock of inputMap.values()) {
            action.add(Connect(designer, clock.getOutputPort(0), o.getInputPort(inIndex + 1)));
            inIndex++;
            if (inIndex === 5)
                break;
        }
    }
}

function handleIC(action: GroupAction, circuitComponents: DigitalComponent[], expression: string,
                  info: DigitalCircuitInfo) {
    const data = ICData.Create(circuitComponents);
    if (!data)
        throw new Error("Failed to create ICData");
    data.setName(expression);
    const ic = new IC(data);
    action.add(SetName(ic, expression));
    action.add(AddICData(data, info.designer));
    action.add(DeleteGroup(info.designer, circuitComponents));
    action.add(Place(info.designer, ic));
    action.add(Translate([ic], [info.camera.getPos()]));
    action.add(Select(info.selections, ic));
}

// TODO: Refactor this to a GroupAction factory once there is a better (and Action) algorithm to arrange the circuit
export function Generate(info: DigitalCircuitInfo, expression: string,
                         userOptions: Partial<ExprToCirGeneratorOptions>) {
    const options = { ...defaultOptions, ...userOptions };
    options.isIC = (options.output !== "Oscilloscope") ? options.isIC : false;
    const ops = (options.format === "custom")
                ? (options.ops)
                : (FORMATS.find((form) => form.icon === options.format) ?? FORMATS[0]);
    const tokenList = GenerateTokens(expression, ops);
    const action = new GroupAction([DeselectAll(info.selections)], "Expression Parser Action");
    const inputMap = new Map<string, DigitalComponent>();
    for (const token of tokenList) {
        if (token.type !== "input" || inputMap.has(token.name))
            continue;
        inputMap.set(token.name, Create<DigitalComponent>(options.input));
        action.add(SetName(inputMap.get(token.name)!, token.name));
    }

    // Create output LED
    const o = Create<DigitalComponent>(options.output);
    action.add(SetName(o, "Output"));

    // Get the generated circuit
    let circuit = new DigitalObjectSet();
    try {
        circuit = ExpressionToCircuit(inputMap, expression, o, ops);
    } catch (e) {
        action.undo(); // Undo any actions that have been done so far
        throw e;
    }

    action.add(AddGroup(info.designer, circuit));

    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    // const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    // TODO: Replace with a better (action based) way of organizing a circuit
    OrganizeMinDepth(circuit, info.camera.getPos());

    const circuitComponents = circuit.getComponents();

    // Add labels if necessary
    if (options.label)
        addLabels(inputMap, action, circuitComponents, info.designer);

    // Set clock frequencies, also connect to oscilloscope if that option is set
    if (options.input === "Clock")
        setClocks(inputMap as Map<string, Clock>, action, options, o, info.designer);

    if (options.isIC) // If creating as IC
        handleIC(action, circuitComponents, expression, info);
    else // If placing directly
        action.add(SelectGroup(info.selections, circuitComponents));

    info.history.add(action);
    info.renderer.render();
}

