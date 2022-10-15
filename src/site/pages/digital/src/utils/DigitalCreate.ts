import {DigitalPortInfo} from "core/views/portinfo/digital";
import {GetPortWorldPos} from "core/views/portinfo/utils";
import {SwitchView}      from "digital/views/components/SwitchView";

import {AUTO_PLACE_LED_SPACE, AUTO_PLACE_SWITCH_SPACE} from "./Constants";

import {V, Vector} from "Vector";

import {GroupAction} from "core/actions/GroupAction";

import {Place, PlaceGroup} from "core/actions/units/Place";

import {DigitalComponent, DigitalPort, DigitalPortGroup} from "core/models/types/digital";

import {CreateComponent} from "core/models/utils/CreateComponent";
import {CreateWire}      from "core/models/utils/CreateWire";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";


export function DigitalCreate(itemKind: DigitalComponent["kind"], pos: Vector, zIndex: number) {
    const [component, ...ports] = CreateComponent(itemKind, zIndex);
    component.x = pos.x;
    component.y = pos.y;
    return [component, ...ports] as [DigitalComponent, ...DigitalPort[]];
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
 * @param info     The circuit info.
 * @param itemKind The `kind` of item.
 * @param options  The options used to indicate what connected components to create.
 * @param N        The number of items to create.
 * @param pos      The position of the first component.
 * @param zIndex   The zIndex of the items.
 * @returns          An action that performs this placement.
 * @throws If the itemId is an invalid item or IC.
 */
export function SmartPlace(info: DigitalCircuitInfo, itemKind: DigitalComponent["kind"], options: SmartPlaceOptions,
                           N: number, pos: Vector, zIndex: number) {
    return new GroupAction(
        new Array(N).fill(0).map((_, i) => {
            // Create and place the component + ports
            const [comp, ...ports] = DigitalCreate(itemKind, pos, zIndex)
            const placeCompAction = PlaceGroup(info.circuit, [comp, ...ports]);

            const compBounds = info.viewManager.calcBoundsOf([comp, ...ports]);

            // Get all input/output ports
            const inputPorts = (options & SmartPlaceOptions.Inputs)
                ? ports.filter((p) => (p.group !== DigitalPortGroup.Output))
                : [];
            const outputPorts = (options & SmartPlaceOptions.Outputs)
                ? ports.filter((p) => (p.group === DigitalPortGroup.Output))
                : [];

            // Create and place switches
            const switchesAndPorts = inputPorts.map((_, j) => {
                const newPos = V(
                    // Place the Switches to the left of the component
                    (compBounds.left - AUTO_PLACE_SWITCH_SPACE),
                    // Center the Switches around the component
                    (compBounds.y + ((inputPorts.length-1)/2 - j) * SwitchView.BOUNDING_HEIGHT)
                );
                return DigitalCreate("Switch", newPos, zIndex);
            });
            const placeSwitchesAction = PlaceGroup(info.circuit, switchesAndPorts.flat());

            // Create and place LEDs
            const ledPortY = DigitalPortInfo["LED"].Positions["1"]["0:0"].target.y;
            const ledsAndPorts = outputPorts.map((port, j) => {
                const newPos = V(
                    // Move LEDs to the right as j increases
                    (compBounds.right + AUTO_PLACE_LED_SPACE*(j+1)),
                    // Center LED around the port of the LED
                    GetPortWorldPos(info.circuit, port).target.y - ledPortY
                );
                return DigitalCreate("LED", newPos, zIndex);
            });
            const placeLEDsAction = PlaceGroup(info.circuit, ledsAndPorts.flat());

            // Connect the switches and LEDs to the component
            const connectionAction = new GroupAction([
                ...inputPorts.map((port, i) =>
                    Place(info.circuit, CreateWire("DigitalWire", switchesAndPorts[i][1].id, port.id))),
                ...outputPorts.map((port, i) =>
                    Place(info.circuit, CreateWire("DigitalWire", port.id, ledsAndPorts[i][1].id))),
            ]);

            // Calculate total bounds of the placed group to offset the position for the next group
            const bounds = info.viewManager.calcBoundsOf([
                comp, ...ports, ...switchesAndPorts.flat(), ...ledsAndPorts.flat(),
            ]);
            pos = pos.sub(0, bounds.height);

            return new GroupAction([
                placeCompAction, placeSwitchesAction, placeLEDsAction, connectionAction,
            ], `Place Group ${i+1}`);
        }),
        "Smart Place Group",
    );
}

