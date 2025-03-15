import {CreateCircuit} from "digital/api/circuit/public"
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent"
import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {V} from "Vector"

export const CreateTestCircuit = () => {
    const [circuit, state] = CreateCircuit();
    return [
        circuit,
        state,
        {
            Place:          (...comps: string[]) => comps.map((c) => circuit.placeComponentAt(c, V(0, 0))),
            TurnOn:         (component: DigitalComponent) => state.sim.setState(component.id, [Signal.On]),
            TurnOff:        (component: DigitalComponent) => state.sim.setState(component.id, [Signal.Off]),
            TurnMetastable: (component: DigitalComponent) => state.sim.setState(component.id, [Signal.Metastable]),
        },
     ] as const
}
