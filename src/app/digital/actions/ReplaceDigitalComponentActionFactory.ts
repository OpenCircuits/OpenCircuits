import {DisconnectAction, ConnectionAction} from "core/actions/addition/ConnectionAction";
import {PlaceAction, DeleteAction} from "core/actions/addition/PlaceAction";
import {GroupAction} from "core/actions/GroupAction";
import {TranslateAction} from "core/actions/transform/TranslateAction";

import {DigitalCircuitDesigner, DigitalComponent} from "digital/models";
import {Switch, XORGate} from "digital/models/ioobjects";


/**
 * Returns a GroupAction for replacing the original component with a new one. Replacement must have at least as many input/output ports
 * as original has in use. original must be placed in designer, and replacement must not be placed in designer.
 * This action implicitly executes on creation.
 * 
 * @param designer the designer that original is placed on
 * @param original the component to replace, already in designer
 * @param replacement the new component, not yet in designer
 * @return a GroupAction containing the actions required to replace the component
 * @throws {Error} if replacement has less input ports than original has in use
 * @throws {Error} if replacement has less output ports than original has in use
 */
 export function CreateReplaceDigitalComponentAction(designer: DigitalCircuitDesigner, original: DigitalComponent, replacement: DigitalComponent): GroupAction {
    const action = new GroupAction();
    const origInputs = original.getInputPorts();
    const origOutputs = original.getOutputPorts();
    const repInputs = replacement.getInputPorts();
    const repOutputs = replacement.getOutputPorts();

    const origInputsInUse = origInputs.filter(port => port.getWires().length > 0);
    const origOutputsInUse = origOutputs.filter(port => port.getWires().length > 0);
    if (origInputsInUse.length > repInputs.length)
        throw new Error(`Insufficient input ports available on replacement (replacement has ${repInputs.length}, needs at least ${origInputsInUse.length})`);
    if (origOutputsInUse.length > repOutputs.length)
        throw new Error(`Insufficient output ports available on replacement (replacement has ${repOutputs.length}, needs at least ${origOutputsInUse.length})`);

    action.add(new PlaceAction(designer, replacement).execute());

    origInputsInUse.forEach((port, index) => {
        const wires = [...port.getWires()];
        wires.forEach(wire => {
            const otherPort = wire.getInput();
            action.add(new DisconnectAction(designer, wire).execute());
            action.add(new ConnectionAction(designer, repInputs[index], otherPort).execute());
        });
    });
    origOutputsInUse.forEach((port, index) => {
        const wires = [...port.getWires()];
        wires.forEach(wire => {
            const otherPort = wire.getOutput();
            action.add(new DisconnectAction(designer, wire).execute());
            action.add(new ConnectionAction(designer, repOutputs[index], otherPort).execute());
        });
    });

    action.add(new TranslateAction([replacement], [replacement.getPos()], [original.getPos()]).execute());
    action.add(new DeleteAction(designer, original).execute());

    return action;
}