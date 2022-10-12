import {AnalogComponent} from "core/models/types/analog";

import {NetlistElement} from "./sim/Netlist";


type NetlistInfoRecord = {
    // The kind of every analog component
    [Comp in AnalogComponent as Comp["kind"]]:
        // Mapped to a callback function (or undefined)
        ((comp: Comp) =>
            // That returns the Netlist info as a tuple of its NGSpice symbol and values
            [NetlistElement["symbol"], NetlistElement["values"]])
        | undefined;
}

/**
 * This is a list of all the netlist information for every Analog component in the circuit.
 *
 * The information is a function that takes in an instance of the corresponding model
 * and returns the Netlist info for that instance.
 *
 * The info is represted as a tuple of the components "Symbol" and "values".
 * The symbol must be a NGSpice netlist symbol found in in https://ngspice.sourceforge.io/docs/ngspice-manual.pdf
 * And the values must be a list of strings representing the NGSpice parameters for that element.
 *
 * Note that you can also specify `undefiend` to represent a component that doesn't need NGSpice info
 *  (and should be ignored).
 */
export const AllNetlistInfo: NetlistInfoRecord = {
    // AnalogNode is purely a user-facing component and has no effect on the actual circuit sim
    "AnalogNode": undefined,

    "Resistor": (r) => ["R", [`${r.resistance}`]],
};
