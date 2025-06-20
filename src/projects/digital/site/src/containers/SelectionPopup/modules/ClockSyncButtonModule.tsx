import {DigitalCircuit, DigitalComponent} from "digital/api/circuit/public";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    circuit: DigitalCircuit;
}
// eslint-disable-next-line arrow-body-style
export const ClockSyncButtonModule = ({ circuit }: Props) => {
    const [props] = useSelectionProps(
        circuit,
        (c): c is DigitalComponent => (c.baseKind === "Component" && c.kind === "Clock"),
        (c) => ({ id: c.id }),
    );

    // Show if valid and if there are multiple clocks
    if (!props || props.id.length < 2)
        return null;

    return (
        <button type="button"
                title="Sychronize start of selected clocks"
                onClick={() => circuit.sim.sync(props.id)}>
            Sync Clocks
        </button>
    );
}
