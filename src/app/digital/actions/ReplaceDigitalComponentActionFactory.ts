import {GroupAction} from "core/actions/GroupAction";

import {ConnectionAction, DisconnectAction} from "core/actions/addition/ConnectionAction";
import {DeleteAction, PlaceAction}          from "core/actions/addition/PlaceAction";

import {TranslateAction} from "core/actions/transform/TranslateAction";

import {DigitalComponent} from "digital/models";

import {Mux} from "digital/models/ioobjects/other/Mux";


/**
 * .
 * Returns a GroupAction for replacing the original component with a new one.
 * Replacement must have at least as many input/output ports as original has in use.
 * Original must be placed in a designer, and replacement must not be placed in a designer.
 * This action implicitly executes on creation.
 *
 * @param original    The component to replace, already in designer.
 * @param replacement The new component, not yet in designer.
 * @returns             A GroupAction containing the actions required to replace the component.
 * @throws If replacement has less input ports than original has in use.
 * @throws If replacement has less output ports than original has in use.
 */
 export function CreateReplaceDigitalComponentAction(original: DigitalComponent,
                                                     replacement: DigitalComponent): GroupAction {
    const designer = original.getDesigner();
    if (!designer)
        throw new Error("original is not in a designer");
    if (replacement.getDesigner())
        throw new Error("replacement is in designer");
    const action = new GroupAction();
    const origInputs = original instanceof Mux
                     ? [...original.getInputPorts(), ...original.getSelectPorts()]
                     : original.getInputPorts();
    const origOutputs = original.getOutputPorts();
    const repInputs = replacement instanceof Mux
                    ? [...replacement.getInputPorts(), ...replacement.getSelectPorts()]
                    : replacement.getInputPorts();
    const repOutputs = replacement.getOutputPorts();

    const origInputsInUse = origInputs.filter(port => port.getWires().length > 0);
    const origOutputsInUse = origOutputs.filter(port => port.getWires().length > 0);
    if (origInputsInUse.length > repInputs.length)
        throw new Error("Insufficient input ports available on replacement " +
                        `(replacement has ${repInputs.length}, needs at least ${origInputsInUse.length})`);
    if (origOutputsInUse.length > repOutputs.length)
        throw new Error("Insufficient output ports available on replacement " +
                        `(replacement has ${repOutputs.length}, needs at least ${origOutputsInUse.length})`);

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