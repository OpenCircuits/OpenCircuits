import {AnalysisInfo} from "analog/api/circuit/internal/sim/Netlist";

export type {AnalysisInfo} from "analog/api/circuit/internal/sim/Netlist";


export interface AnalogSim {
    analysis: AnalysisInfo;

    // Runs the simulation on the current Circuit setup.
    // Will return errors if it fails to validate the circuit.
    run(): void;
}
