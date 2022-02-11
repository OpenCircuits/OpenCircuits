import {Create} from "serialeazy";

import {OperatorFormat,
        OperatorFormatLabel} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {Formats}             from "digital/utils/ExpressionParser/Constants/Formats";

import {AddGroupAction}          from "core/actions/addition/AddGroupAction";
import {ConnectionAction}        from "core/actions/addition/ConnectionAction";
import {PlaceAction}             from "core/actions/addition/PlaceAction";
import {GroupAction}             from "core/actions/GroupAction";
import {SetNameAction}           from "core/actions/SetNameAction";
import {TranslateAction}         from "core/actions/transform/TranslateAction";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";
import {CreateDeselectAllAction,
        SelectAction,
        CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {OrganizeMinDepth} from "core/utils/ComponentOrganizers";

import {CreateICDataAction}    from "digital/actions/CreateICDataAction";
import {FrequencyChangeAction} from "digital/actions/FrequencyChangeAction";
import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {DigitalCircuitDesigner, DigitalComponent, DigitalObjectSet} from "digital/models";
import {ICData, IC, Clock, Label}           from "digital/models/ioobjects";

import {DigitalCircuitInfo}  from "digital/utils/DigitalCircuitInfo";
import {ExpressionToCircuit} from "digital/utils/ExpressionParser";
import {GenerateTokens}      from "digital/utils/ExpressionParser/GenerateTokens";


export type ExprToCirGeneratorOptions = {
    input: InputTypes,
    output: OutputTypes,
    isIC: boolean,
    connectClocksToOscope: boolean,
    label: boolean,
    format: OperatorFormatLabel,
    ops: OperatorFormat,
}

export type InputTypes = "Button" | "Clock" | "Switch";
export type OutputTypes = "Oscilloscope" | "LED";

const defaultOptions: ExprToCirGeneratorOptions = {
    input: "Switch",
    output: "LED",
    isIC: false,
    connectClocksToOscope: false,
    label: false,
    format: "|",
    ops: Formats[0],
}

function addLabels(inputMap: Map<string, DigitalComponent>, action: GroupAction,
    circuitComponents: DigitalComponent[], designer: DigitalCircuitDesigner) {
    // Add labels next to inputs
    // TODO: This will have to be redone when there is a better organization algorithm
    for (const [name, component] of inputMap) {
        const newLabel = Create<Label>("Label");
        const pos = component.getPos().sub(newLabel.getSize().x + component.getSize().x, 0);
        action.add(new PlaceAction(designer, newLabel).execute());
        action.add(new SetNameAction(newLabel, name).execute());
        action.add(new TranslateAction([newLabel], [newLabel.getPos()], [pos]).execute());
        circuitComponents.push(newLabel);
    }
}

function setClocks(inputMap: Map<string, Clock>, action: GroupAction, options: ExprToCirGeneratorOptions,
    o: DigitalComponent, designer: DigitalCircuitDesigner) {
    let inIndex = 0;
    // Set clock frequencies
    for (const clock of inputMap.values()) {
        action.add(new FrequencyChangeAction(clock, 500 * (2 ** inIndex)).execute());
        inIndex = Math.min(inIndex + 1, 4);
    }
    // Connect clocks to oscilloscope
    if (options.connectClocksToOscope) {
        inIndex = 0;
        action.add(new InputPortChangeAction(o, 1, Math.min(inputMap.size + 1, 6)).execute());
        for (const clock of inputMap.values()) {
            action.add(new ConnectionAction(designer, clock.getOutputPort(0), o.getInputPort(inIndex + 1)).execute());
            inIndex++;
            if (inIndex === 5) break;
        }
    }
}

function handleIC(action: GroupAction, circuitComponents: DigitalComponent[], expression: string, info: DigitalCircuitInfo) {
    const data = ICData.Create(circuitComponents);
    if (!data)
        throw new Error("Failed to create ICData");
    data.setName(expression);
    const ic = new IC(data);
    action.add(new SetNameAction(ic, expression).execute());
    action.add(new CreateICDataAction(data, info.designer).execute());
    action.add(CreateDeleteGroupAction(info.designer, circuitComponents).execute());
    action.add(new PlaceAction(info.designer, ic).execute());
    action.add(new TranslateAction([ic], [ic.getPos()], [info.camera.getPos()]).execute());
    action.add(new SelectAction(info.selections, ic).execute());
}

// TODO: Refactor this to a GroupAction factory once there is a better (and Action) algorithm to arrange the circuit
export function Generate(info: DigitalCircuitInfo, expression: string,
                         userOptions: Partial<ExprToCirGeneratorOptions>) {
    const options = {...defaultOptions, ...userOptions};
    options.isIC = (options.output !== "Oscilloscope") ? options.isIC : false;
    const ops = (options.format === "custom") ? (options.ops) : (Formats.find(form => form.icon === options.format) ?? Formats[0]);

    // Create input tokens
    const tokenList = GenerateTokens(expression, ops);
    const action = new GroupAction([CreateDeselectAllAction(info.selections).execute()]);
    const inputMap = new Map<string, DigitalComponent>();
    for (const token of tokenList) {
        if (token.type !== "input" || inputMap.has(token.name))
            continue;
        inputMap.set(token.name, Create<DigitalComponent>(options.input));
        action.add(new SetNameAction(inputMap.get(token.name)!, token.name).execute());
    }

    // Create output LED
    const o = Create<DigitalComponent>(options.output);
    action.add(new SetNameAction(o, "Output").execute());

    // Get the generated circuit
    let circuit = new DigitalObjectSet();
    try {
        circuit = ExpressionToCircuit(inputMap, expression, o, ops);
    } catch (err) {
        action.undo(); // Undo any actions that have been done so far
        throw err;
    }

    action.add(new AddGroupAction(info.designer, circuit).execute());

    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    // TODO: Replace with a better (action based) way of organizing a circuit
    OrganizeMinDepth(circuit, startPos);

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
        action.add(CreateGroupSelectAction(info.selections, circuitComponents).execute());

    info.history.add(action);
    info.renderer.render();
}

