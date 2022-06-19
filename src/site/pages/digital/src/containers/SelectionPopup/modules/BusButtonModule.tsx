import {CircuitInfo} from "core/utils/CircuitInfo";

import {CreateBusAction} from "digital/actions/addition/BusActionFactory";

import {OutputPort, InputPort} from "digital/models";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    info: CircuitInfo;
}
export const BusButtonModule = ({ info }: Props) => {
    const { renderer, history } = info;

    const [props, ps] = useSelectionProps(
        info,
        (s): s is (InputPort | OutputPort) => (
            (s instanceof InputPort && s.getWires().length === 0) ||
            s instanceof OutputPort
        ),
        (s) => ({ type: (s instanceof InputPort ? "input" : "output") })
    );

    if (!props)
        return null;

    const iports = ps.filter(s => s instanceof InputPort)  as InputPort[];
    const oports = ps.filter(s => s instanceof OutputPort) as OutputPort[];

    if (iports.length !== oports.length)
        return null

    return <button
        title="Create a bus between selected ports"
        onClick={() => {
            history.add(CreateBusAction(oports, iports).execute());
            renderer.render();
        }}>
        Bus
    </button>
}
