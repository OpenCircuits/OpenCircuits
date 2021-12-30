import {Create} from "serialeazy";

import {OperatorFormatLabel} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {Formats} from "digital/utils/ExpressionParser/Constants/Formats";

import {AddGroupAction} from "core/actions/addition/AddGroupAction";
import {PlaceAction} from "core/actions/addition/PlaceAction";
import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction, SelectAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {OrganizeMinDepth} from "core/utils/ComponentOrganizers";

import {CreateICDataAction} from "digital/actions/CreateICDataAction";

import {DigitalComponent, DigitalObjectSet} from "digital/models";
import {ICData, IC, Clock} from "digital/models/ioobjects";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {ExpressionToCircuit} from "digital/utils/ExpressionParser";
import {GenerateTokens} from "digital/utils/ExpressionParser/GenerateTokens";
import {OperatorFormat} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";
import {FrequencyChangeAction} from "digital/actions/FrequencyChangeAction";
import {SetNameAction} from "core/actions/SetNameAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {PortChangeAction} from "core/actions/ports/PortChangeAction";
import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";


export type ExprToCirGeneratorOptions = {
    input?: InputTypes,
    output?: OutputTypes,
    isIC?: boolean,
    connectClocksToOscope?: boolean,
    format?: OperatorFormatLabel,
    ops?: OperatorFormat,
}

export type InputTypes = "Button" | "Clock" | "Switch";
export type OutputTypes = "Oscilloscope" | "LED";

// TODO: Refactor this to a GroupAction factory once there is a better (and Action) algorithm to arrange the circuit
export function Generate(info: DigitalCircuitInfo, expression: string,
                         options: ExprToCirGeneratorOptions) {
    const input = options.input ?? "Switch";
    const output = options.output ?? "LED";
    const isIC = (output !== "Oscilloscope") ? (options.isIC ?? false) : false;
    const connectClocksToOscope = options.connectClocksToOscope ?? false;
    const format = options.format ?? "|";
    const ops = (format === "custom") ? (options.ops ?? Formats[0]) : Formats.find(form => form.icon === format);

    // Create input tokens
    const tokenList = GenerateTokens(expression, ops);
    const action = new GroupAction([CreateDeselectAllAction(info.selections).execute()]);
    const inputMap = new Map<string, DigitalComponent>();
    for (const token of tokenList) {
        if (token.type !== "input" || inputMap.has(token.name))
            continue;
        inputMap.set(token.name, Create<DigitalComponent>(input));
        action.add(new SetNameAction(inputMap.get(token.name), token.name).execute());
    }

    // Create output LED
    const o = Create<DigitalComponent>(output);
    action.add(new SetNameAction(o, "Output").execute());

    // Get the generated circuit
    let circuit = new DigitalObjectSet();
    try {
        circuit = ExpressionToCircuit(inputMap, expression, o, ops);
    } catch (err) {
        action.undo(); // Undo any actions that have been done so far
        throw err;
    }

    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    action.add(new AddGroupAction(info.designer, circuit).execute());
    OrganizeMinDepth(circuit, startPos);
    if (input === "Clock") {
        let inIndex = 0;
        if (connectClocksToOscope)
            action.add(new InputPortChangeAction(o, 1, inputMap.size+1).execute());
        for (let clock of inputMap.values() as IterableIterator<Clock>) {
            action.add(new FrequencyChangeAction(clock, 500 * (2 ** inIndex)).execute());
            if (connectClocksToOscope)
                action.add(new ConnectionAction(info.designer, clock.getOutputPort(0), o.getInputPort(inIndex+1)).execute());
            inIndex = inIndex >= 4 ? 4 : inIndex + 1;
        }
    }

    if (isIC) { // If creating as IC
        const data = ICData.Create(circuit);
        if (!data)
            throw new Error("Failed to create ICData");
        data.setName(expression);
        const ic = new IC(data);
        action.add(new SetNameAction(ic, expression).execute());
        action.add(new CreateICDataAction(data, info.designer).execute());
        action.add(CreateDeleteGroupAction(info.designer, circuit.getComponents()).execute());
        action.add(new PlaceAction(info.designer, ic).execute());
        action.add(new TranslateAction([ic], [ic.getPos()], [info.camera.getPos()]).execute());
        action.add(new SelectAction(info.selections, ic).execute());
    } else { // If placing directly
        action.add(CreateGroupSelectAction(info.selections, circuit.getComponents()).execute());
    }

    info.history.add(action);
    info.renderer.render();
}

