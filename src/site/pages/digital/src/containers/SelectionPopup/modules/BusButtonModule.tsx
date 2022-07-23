import {CircuitInfo} from "core/utils/CircuitInfo";
import {GetAllPorts} from "core/utils/ComponentUtils";

import {Component} from "core/models";

import {CreateBusAction} from "digital/actions/addition/BusActionFactory";

import {InputPort, OutputPort} from "digital/models";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    info: CircuitInfo;
}
export const BusButtonModule = ({ info }: Props) => {
    const { renderer, history } = info;

    const [props, items] = useSelectionProps(
        info,
        (s): s is (Component | InputPort | OutputPort) => (
            (s instanceof Component ||
             s instanceof InputPort && s.getWires().length === 0) ||
             s instanceof OutputPort && s.getWires().length === 0
        ),
        (s) => ({ type: (s instanceof Component ? "component" : "port") })
    );

    if (!props)
        // No valid selections
        return null;

    let iports = items.filter(s => s instanceof InputPort)  as InputPort[];
    let oports = items.filter(s => s instanceof OutputPort) as OutputPort[];
    const components = items.filter(s => s instanceof Component) as Component[];

    if ( (iports.length > 0 || oports.length > 0) && components.length > 0) {
        // Introduces ambiguity between components and individual ports
        return null;
    }

    if (iports.length === 0 && oports.length === 0) {
        // No individual ports selected, only components are selected
        const ambiComps = components.filter(s => s.getPorts().some(p => p instanceof InputPort &&
                                                                        p.getWires().length === 0) ===
                                                 s.getPorts().some(p => p instanceof OutputPort &&
                                                                        p.getWires().length === 0)) as Component[];
        for (let i = 0; i < components.length; i++) {
            if (ambiComps.includes(components[i])) {
                components.splice(i, 1);
                i--;
            }
        }
        const outputComps = components.filter(s => s.getPorts().some(p => p instanceof OutputPort &&
                                                                          p.getWires().length === 0)) as Component[];
        const inputComps = components.filter(s => s.getPorts().some(p => p instanceof InputPort &&
                                                                         p.getWires().length === 0)) as Component[];
        // three cases:
        //   - only input and output components are selected
        //   - only input and ambi components are selected
        //   - only output and ambi components are selected
        if (inputComps.length > 0 && outputComps.length > 0 && ambiComps.length === 0) {
            iports = GetAllPorts(inputComps).filter(p => p instanceof InputPort) as InputPort[];
            oports = GetAllPorts(outputComps).filter(p => p instanceof OutputPort) as OutputPort[];
        } else if (inputComps.length > 0 && ambiComps.length > 0 && outputComps.length === 0) {
            iports = GetAllPorts(inputComps).filter(p => p instanceof InputPort) as InputPort[];
            oports = GetAllPorts(ambiComps).filter(p => p instanceof OutputPort) as OutputPort[];
        } else if (outputComps.length > 0 && ambiComps.length > 0 && inputComps.length === 0) {
            iports = GetAllPorts(ambiComps).filter(p => p instanceof InputPort) as InputPort[];
            oports = GetAllPorts(outputComps).filter(p => p instanceof OutputPort) as OutputPort[];
        }
    }

    if (iports.length !== oports.length || iports.length === 0 || oports.length === 0) {
        // Port counts mismatch or no ports selected
        return null
    }

    return (
        <button type="button"
                title="Create a bus between selected ports"
                onClick={() => {
                    history.add(CreateBusAction(oports, iports).execute());
                    renderer.render();
                }}>
            Bus
        </button>
    );
}
