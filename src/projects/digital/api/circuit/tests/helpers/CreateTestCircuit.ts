import {CreateCircuit} from "digital/api/circuit/public"
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent"
import {DigitalPort} from "digital/api/circuit/public/DigitalPort"
import {Signal} from "digital/api/circuit/utils/Signal"
import {V} from "Vector"

export const CreateTestCircuit = () => {
    const [circuit, { sim }] = CreateCircuit();
    return [
        circuit,
        {
            Place:          (...comps: string[]) => comps.map((c) => circuit.placeComponentAt(c, V(0, 0))),
            GetSignal:      (port: DigitalPort) => sim.getSignal(port.id),
            TurnOn:         (component: DigitalComponent) => sim.setState(component.id, [Signal.On]),
            TurnOff:        (component: DigitalComponent) => sim.setState(component.id, [Signal.Off]),
            TurnMetastable: (component: DigitalComponent) => sim.setState(component.id, [Signal.Metastable]),
        },
     ] as const
}
