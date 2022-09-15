import {Create} from "serialeazy";

import {AUTO_PLACE_LED_SPACE, AUTO_PLACE_SWITCH_SPACE} from "./Constants";

import {V, Vector} from "Vector";

import {CircuitBoundingBox} from "core/utils/ComponentUtils";

import {GroupAction} from "core/actions/GroupAction";

import {Connect}    from "core/actions/units/Connect";
import {PlaceGroup} from "core/actions/units/Place";

import {DigitalCircuitDesigner, DigitalComponent, InputPort, OutputPort} from "digital/models";

import {IC, LED, Switch} from "digital/models/ioobjects";


/**
 * Utility function that creates a DigitalComponent from the given itemId
 *  This does more then simply using the `Create` function since it also takes into
 *  account ICs.
 *
 * @param itemId   The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *           corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param designer The circuit designer for the items. Needed for access to ICs.
 * @returns          The DigitalComponent associated with the given ID.
 * @throws If the itemId is an invalid item or IC.
 */
export function DigitalCreate(itemId: string, designer: DigitalCircuitDesigner): DigitalComponent {
    let component: DigitalComponent;

    if (itemId.startsWith("ic")) {
        const [, id] = itemId.split("/");
        component = new IC(designer.getICData()[parseInt(id)]);
    } else {
        component = Create<DigitalComponent>(itemId);
    }

    if (!component)
        throw new Error(`Failed to create digital item w/ id: ${itemId}`);

    return component;
}


/**
 * Utility function that creates `N` DigitalComponents from the given `itemId`. It also
 *  will position them vertically starting at the given `pos` vector.
 *
 * @param pos      The position of the first component.
 * @param itemId   The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *           corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param designer The cirucit designer for the items. Needed for access to ICs.
 * @param N        The number of items to create.
 * @returns          The list of DigitalComponents associated with the given ID and of length `N`.
 * @throws If the itemId is an invalid item or IC.
 */
export function DigitalCreateN(pos: Vector, itemId: string, designer: DigitalCircuitDesigner,
                               N: number): DigitalComponent[] {
    const comps = [] as DigitalComponent[];

    for (let i = 0; i < N; i++) {
        const comp = DigitalCreate(itemId, designer);

        comp.setPos(pos);

        comps.push(comp);

        // Place the components vertically
        pos = pos.add(0, -comp.getCullBox().getSize().y);
    }

    return comps;
}


export enum SmartPlaceOptions {
    Off     = 0,
    Inputs  = 1 << 0,
    Outputs = 1 << 1,
    Full    = Inputs | Outputs,
}


/**
 * Utility function that, given a DigitalComponent id, will create the component N times vertically
 *  (with behavior matches DigitalCreateN) but also create Switches for each input and LEDs for each
 *  output and automatically connect them together. Starts placing at position `pos`.
 * This function is directly used for implementation of issue #689.
 *
 * @param pos      The position of the first component.
 * @param itemId   The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *           corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param designer The cirucit designer for the items. Needed for access to ICs.
 * @param N        The number of items to create.
 * @param options  The options used to indicate what connected components to create.
 * @returns          A GroupAction to place and connect all the components.
 * @throws If the itemId is an invalid item or IC.
 */
export function SmartPlace(pos: Vector, itemId: string, designer: DigitalCircuitDesigner,
                           N: number, options: SmartPlaceOptions): GroupAction {
    const action = new GroupAction([], "Smart Place Group");

    for (let i = 0; i < N; i++) {
        const comp = DigitalCreate(itemId, designer);
        comp.setPos(pos);

        // Need to do it like this rather then comp.getInputPorts() since this can
        //  account for things like the Select ports on Multiplexers
        const inputPorts  = (options & SmartPlaceOptions.Inputs) ?
            comp.getPorts().filter((p) => p instanceof InputPort)  : [];

        const outputPorts = (options & SmartPlaceOptions.Outputs) ?
            comp.getPorts().filter((p) => p instanceof OutputPort) : [];

        const inputs  =  inputPorts.map((_) => new Switch());
        const outputs = outputPorts.map((_) => new LED());

        inputs.forEach((s, i) => {
            s.setPos(V(-comp.getCullBox().getSize().x/2 - AUTO_PLACE_SWITCH_SPACE,
                       ((inputs.length-1)/2 - i)*s.getCullBox().getSize().y).add(comp.getPos()));
        });
        outputs.forEach((l, i) => {
            l.setPos(V(comp.getCullBox().getSize().x/2 + AUTO_PLACE_LED_SPACE*(i+1),
                       // This centers the LED around the port of the LED
                       outputPorts[i].getTargetPos().y - l.getInputPort(0).getTargetPos().y).add(comp.getPos()));
        });

        action.add(new GroupAction([
            PlaceGroup(designer, [comp, ...inputs, ...outputs]),
            // TODO: Have these use Bus action to connect better, since sometimes
            //  indices don't match up well. This will require improvement of bussing though
            //  since a quick test showed that it didn't work too well currently
            new GroupAction(
                inputs.map((v, i) => Connect(designer, v.getOutputPort(0), inputPorts[i]))
            ),
            new GroupAction(
                outputs.map((v, i) => Connect(designer, outputPorts[i], v.getInputPort(0)))
            ),
        ], "Smart Place"));

        const totalCullBox = CircuitBoundingBox([comp, ...inputs, ...outputs]);
        pos = pos.add(V(0, -totalCullBox.getHeight()));
    }

    return action;
}

