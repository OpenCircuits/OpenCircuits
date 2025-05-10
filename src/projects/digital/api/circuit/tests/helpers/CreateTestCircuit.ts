import "./Extensions";

import {CreateCircuit} from "digital/api/circuit/public"
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent"
import {Signal} from "digital/api/circuit/schema/Signal";
import {V, Vector} from "Vector"
import {DigitalPort} from "digital/api/circuit/public/DigitalPort";
import {DigitalWire} from "digital/api/circuit/public/DigitalWire";
import {MapObj} from "shared/api/circuit/utils/Functions";
import {InstantSimRunner} from "digital/api/circuit/internal/sim/DigitalSimRunner";


export const CreateTestCircuit = (sim = true) => {
    const [circuit, state] = CreateCircuit();

    if (sim)
        state.simRunner = new InstantSimRunner(state.sim);

    const helpers = {
        Place:          (...comps: string[]) => comps.map((c) => circuit.placeComponentAt(c, V(0, 0))),
        PlaceAt:        (...comps: Array<[string, Vector]>) => comps.map(([c, pos]) => circuit.placeComponentAt(c, pos)),
        TurnOn:         (component: DigitalComponent) => state.sim.setState(component.id, [Signal.On]),
        TurnOff:        (component: DigitalComponent) => state.sim.setState(component.id, [Signal.Off]),
        TurnMetastable: (component: DigitalComponent) => state.sim.setState(component.id, [Signal.Metastable]),
        Connect:        (o1: DigitalComponent | DigitalPort | DigitalPort[],
                         o2: DigitalComponent | DigitalPort | DigitalPort[]): DigitalWire | undefined => {
            if (Array.isArray(o1) || Array.isArray(o2)) {
                return helpers.Connect(
                    Array.isArray(o1) ? o1[0] : o1,
                    Array.isArray(o2) ? o2[0] : o2,
                );
            }
            if (o1.baseKind === "Port" && o2.baseKind === "Port") {
                return o1.connectTo(o2);
            }
            if (o1.baseKind === "Port" && o2.baseKind === "Component") {
                return o1.connectTo(o2.inputs[0]);
            }
            if (o1.baseKind === "Component" && o2.baseKind === "Port") {
                return o1.outputs[0].connectTo(o2);
            }
            if (o1.baseKind === "Component" && o2.baseKind === "Component") {
                return o1.outputs[0].connectTo(o2.inputs[0]);
            }
            throw new Error("?");
        },
        // Automatically places the component and returns switches connected to each input and leds to each output
        PlaceAndConnect: (kind: string) => {
            const component = circuit.placeComponentAt(kind, V(0, 0));
            const objs = MapObj(component.ports, ([_, ports]) =>
                ports.map((p) => {
                    if (p.isInputPort) {
                        const sw = circuit.placeComponentAt("Switch", V(0, 0));
                        sw.outputs[0].connectTo(p);
                        return sw;
                    } else if (p.isOutputPort) {
                        const led = circuit.placeComponentAt("LED", V(0, 0));
                        p.connectTo(led.inputs[0]);
                        return led;
                    }
                    throw new Error("Non input or output port!");
                }));

            return [component, objs] as const;
        },
    };

    return [
        circuit,
        state,
        helpers,
     ] as const
}
