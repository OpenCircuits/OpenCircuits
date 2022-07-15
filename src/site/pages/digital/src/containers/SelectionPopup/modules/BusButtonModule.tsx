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
        return null;

    let iports = items.filter(s => s instanceof InputPort)  as InputPort[];
    let oports = items.filter(s => s instanceof OutputPort) as OutputPort[];

    // Filter out all InputPorts and Output ports for all components and concat them
    // to their respective array.
    let components = items.filter(s => s instanceof Component) as Component[];
    components = components.filter(s => s.getPorts().filter(p => p instanceof InputPort).length !==
                                        s.getPorts().filter(p => p instanceof OutputPort).length);
    if (components.length > 0) {
        const cports = GetAllPorts(components);
        const ciports = cports.filter(s => s instanceof InputPort && s.getWires().length === 0) as InputPort[];
        const coports = cports.filter(s => s instanceof OutputPort && s.getWires().length === 0) as OutputPort[];
        iports = [...iports, ...ciports];
        oports = [...oports, ...coports];
    }

    if (iports.length !== oports.length ||
        iports.length === 0 ||
        oports.length === 0)
        return null

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
