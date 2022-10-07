import {SelectionsWrapper} from "core/utils/SelectionsWrapper";

import {GroupAction} from "core/actions/GroupAction";

import {Connect, Disconnect}      from "core/actions/units/Connect";
import {Delete, Place}            from "core/actions/units/Place";
import {DeselectAll, SelectGroup} from "core/actions/units/Select";
import {Translate}                from "core/actions/units/Translate";

import {CreateDigitalComponent, GetPortChangeAction} from "digital/utils/ReplaceDigitalComponentHelpers";

import {DigitalCircuitDesigner, DigitalComponent, InputPort, OutputPort} from "digital/models";


/**
 * Returns a GroupAction for replacing the original component with a new one.
 * Replacement must be able to have at least as many input/output ports as original has in use.
 * Original must be placed in a designer.
 *
 * @param designer        The circuit designer for the component.
 * @param comp            The component to replace.
 * @param replacement     The new component's replacement info.
 * @param replacement.id  The new component's replacement ID.
 * @param replacement.amt The new component's port amount.
 * @param selections      If supplied, deselects the current selection and selects replacement.
 * @returns                 A GroupAction containing the actions required to
 *                  replace the component and the new component.
 * @throws If original is not in a designer.
 * @throws If replacement is a string that does not represent a valid component.
 */
export function ReplaceComponent(designer: DigitalCircuitDesigner,
                                 comp: DigitalComponent,
                                 replacement: { id: string, amt?: number },
                                 selections?: SelectionsWrapper): [GroupAction, DigitalComponent] {
    // Create replacement component
    const replacementComponent = CreateDigitalComponent(replacement.id, designer);
    if (!replacementComponent)
        throw new Error(`Supplied replacement id "${replacement.id}" is invalid`);

    const action = new GroupAction(
        [], "Replace Digital Component",
        [`Replacing "${comp.getName()}" with a(n) "${replacementComponent.getName()}"`]
    );

    // Change name of replacement component to be the replaced one if set
    if (comp.isNameSet())
        replacementComponent.setName(comp.getName());

    // Move replacement to the replaced position
    action.add(Translate([replacementComponent], [comp.getPos()]));

    if (selections)
        action.add(DeselectAll(selections));
    action.add(Place(designer, replacementComponent));
    if (selections)
        action.add(SelectGroup(selections, [replacementComponent]));

    // Only set ports if there is an amount to set, otherwise the ports can't be changed
    if (replacement.amt)
        action.add(GetPortChangeAction(replacementComponent, replacement.amt));

    const compInputs  = comp.getPorts().filter((p) => (p instanceof  InputPort)) as InputPort[];
    const compOutputs = comp.getPorts().filter((p) => (p instanceof OutputPort)) as OutputPort[];
    const repInputs   = replacementComponent.getPorts().filter((p) => (p instanceof  InputPort)) as InputPort[];
    const repOutputs  = replacementComponent.getPorts().filter((p) => (p instanceof OutputPort)) as OutputPort[];

    compInputs.forEach((port, index) => {
        [...port.getWires()].forEach((wire) => {
            const otherPort = wire.getInput();
            action.add(Disconnect(designer, wire));
            action.add(Connect(designer, repInputs[index], otherPort));
        });
    });
    compOutputs.forEach((port, index) => {
        [...port.getWires()].forEach((wire) => {
            const otherPort = wire.getOutput();
            action.add(Disconnect(designer, wire));
            action.add(Connect(designer, repOutputs[index], otherPort));
        });
    });

    // Finally, delete the original component
    action.add(Delete(designer, comp));

    return [action, replacementComponent];
}
