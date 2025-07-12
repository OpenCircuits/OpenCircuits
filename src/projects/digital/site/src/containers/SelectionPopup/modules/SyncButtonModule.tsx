import {DigitalCircuit, DigitalComponent} from "digital/api/circuit/public";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    circuit: DigitalCircuit;
}
// eslint-disable-next-line arrow-body-style
export const SyncButtonModule = ({ circuit }: Props) => {
    const [props] = useSelectionProps(
        circuit,
        (c): c is DigitalComponent => (c.baseKind === "Component" && (c.kind === "Clock" || c.kind === "Oscilloscope")),
        (c) => ({ id: c.id }),
    );

    // Show if valid and if there are multiple components
    if (!props || props.id.length < 2)
        return;

    return (
        <button type="button"
                title="Synchronize start of selected components"
                onClick={() => circuit.sim.sync(props.id)}>
            Sync
        </button>
    );
}
