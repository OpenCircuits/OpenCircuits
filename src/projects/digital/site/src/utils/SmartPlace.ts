import {V, Vector} from "Vector";
import {Rect} from "math/Rect";
import {DigitalCircuit} from "digital/api/circuit/public";


export const enum SmartPlaceOptions {
    Off     = 0,
    Inputs  = 1 << 0,
    Outputs = 1 << 1,
    Full    = Inputs | Outputs,
}

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

        const inputPorts = (options & SmartPlaceOptions.Inputs) ? comp.inputs : [];

        const outputPorts = (options & SmartPlaceOptions.Outputs) ? comp.outputs : [];

        const inputs = inputPorts.toSorted(({ targetPos: targetPosA }, { targetPos: targetPosB }) =>
            targetPosB.y - targetPosA.y || targetPosA.x - targetPosB.x
        ).map((port) => {
            const sw = circuit.placeComponentAt("Switch", V(0, 0));
            port.connectTo(sw.outputs[0]);
            return sw;
        });
        const outputs = outputPorts.toSorted(({ targetPos: targetPosA }, { targetPos: targetPosB }) =>
            targetPosB.y - targetPosA.y || targetPosA.x - targetPosB.x
        ).map((port) => {
            const led = circuit.placeComponentAt("LED", V(0, 0));
            port.connectTo(led.inputs[0]);
            return led;
        });

        // Using the bounding box of the component with ports gives more spacing betwen it and the inputs/outputs
        const compBoundsWithPorts = Rect.Bounding([comp.bounds, ...comp.allPorts.map((port) => port.bounds)]);
        inputs.forEach((s, i) => {
            s.pos = V(-compBoundsWithPorts.size.x / 2 - AUTO_PLACE_SWITCH_SPACE,
                ((inputPorts.length - 1) / 2 - i) * s.bounds.size.y).add(comp.pos);
        });
        outputs.forEach((l, i) => {
            l.pos = V(compBoundsWithPorts.size.x / 2 + AUTO_PLACE_LED_SPACE * (i + 1),
                // This centers the LED around the port of the LED
                (outputPorts[i].targetPos.y - comp.y) - (l.inputs[0].targetPos.y - l.y)).add(comp.pos)
        });

        pos = pos.sub(V(0, Rect.Bounding([
            compBoundsWithPorts,
            ...inputs.flatMap(({ allPorts, bounds }) => [bounds, ...allPorts.map(({ bounds }) => bounds)]),
            ...outputs.flatMap(({ allPorts, bounds }) => [bounds, ...allPorts.map(({ bounds }) => bounds)]),
        ]).height));
    }

    circuit.commitTransaction("Placed Group");
}
