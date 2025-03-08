import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim"
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent"
import {Signal} from "digital/api/circuit/utils/Signal"

export const turnOn = (sim: DigitalSim, component: DigitalComponent) => {sim.setState(component.id, [Signal.On])}
export const turnOff = (sim: DigitalSim, component: DigitalComponent) => {sim.setState(component.id, [Signal.Off])}
export const turnMetastable = (sim: DigitalSim, component: DigitalComponent) => {sim.setState(component.id, [Signal.Metastable])}
