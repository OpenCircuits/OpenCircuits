import {useLayoutEffect} from "react";

import {usePageVisibility} from "shared/site/utils/hooks/usePageVisibility";

import {MainDesigner} from "shared/site/containers/MainDesigner";

// import {SmartPlaceOptions} from "digital/site/utils/DigitalCreate";
import {useMainDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";

import "./index.scss";
import {DigitalCircuit} from "digital/api/circuit/public";
import {SmartPlaceOptions} from "digital/site/utils/DigitalCreate";
import {V, Vector} from "Vector";

// import {useMainCircuit} from "shared/site/utils/hooks/useCircuit";


const AUTO_PLACE_SWITCH_SPACE = 2.5;
const AUTO_PLACE_LED_SPACE = 1;
/**
 * Utility function that, given a DigitalComponent id, will create the component N times vertically
 *  (with behavior matches DigitalCreateN) but also create Switches for each input and LEDs for each
 *  output and automatically connect them together. Starts placing at position `pos`.
 * This function is directly used for implementation of issue #689.
 *
 * @param pos     The position of the first component.
 * @param itemId  The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *                corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param circuit The cirucit the items. Needed to place items.
 * @param N       The number of items to create.
 * @param options The options used to indicate what connected components to create.
 * @throws If the itemId is an invalid item or IC.
 */
export function SmartPlace(pos: Vector, itemId: string, circuit: DigitalCircuit,
    N: number, options: SmartPlaceOptions) {
    circuit.beginTransaction();
    for (let i = 0; i < N; i++) {
        const comp = circuit.placeComponentAt(itemId, pos);

        // Need to do it like this rather then comp.getInputPorts() since this can
        //  account for things like the Select ports on Multiplexers
        const inputPorts = (options & SmartPlaceOptions.Inputs) ? comp.inputs : [];

        const outputPorts = (options & SmartPlaceOptions.Outputs) ? comp.outputs : [];

        const inputs = inputPorts.map((port) => {
            const sw = circuit.placeComponentAt("Switch", V(0, 0));
            port.connectTo(sw.outputs[0]);
            return sw;
        });
        const outputs = outputPorts.map((port) => {
            const led = circuit.placeComponentAt("LED", V(0, 0));
            port.connectTo(led.inputs[0]);
            return led;
        });

        inputs.forEach((s, i) => {
            s.pos = V(-comp.bounds.size.x / 2 - AUTO_PLACE_SWITCH_SPACE,
                ((inputPorts.length - 1) / 2 - i) * comp.bounds.size.y).add(comp.pos);
        });
        outputs.forEach((l, i) => {
            l.pos = V(comp.bounds.size.x / 2 + AUTO_PLACE_LED_SPACE * (i + 1),
                // This centers the LED around the port of the LED
                outputPorts[i].targetPos.y - comp.inputs[0].targetPos.y).add(comp.pos)
        });
    }

    circuit.commitTransaction();
}

export const DigitalMainDesigner = ({ circuit }: {circuit: DigitalCircuit}) => {
    const designer = useMainDigitalDesigner();
    const isPageVisible = usePageVisibility();

    useLayoutEffect(() => {
        // TODO
        // if (isPageVisible)
        //     info.designer.resume();
        // else
        //     info.designer.pause();
    }, [designer, isPageVisible]);

    return (
        <MainDesigner
            otherPlace={(pos, itemKind, num, smartPlaceOptions) => {
                const smartPlaceOption = Array.isArray(smartPlaceOptions) ? smartPlaceOptions.at(0) : undefined;
                if (smartPlaceOption === SmartPlaceOptions.Full ||
                    smartPlaceOption === SmartPlaceOptions.Inputs ||
                    smartPlaceOption === SmartPlaceOptions.Outputs) {
                    SmartPlace(pos, itemKind, circuit, num, smartPlaceOption);
                    return true;
                }
                return false;
            }} />
    );
}
