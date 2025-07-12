import {DigitalCircuit, DigitalComponent} from "digital/api/circuit/public";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    circuit: DigitalCircuit;
}
export const ClearButtonModule = ({ circuit }: Props) => {
    const [props, cs] = useSelectionProps(
        circuit,
        (c): c is DigitalComponent => (c.baseKind === "Component" && c.kind === "Oscilloscope"),
        (c) => ({ id: c.id }),
    );

    // Show if valid and if there are multiple components
    if (!props)
        return;

    return (
        <button type="button"
                title="Clear the Oscilloscope readings"
                onClick={() => cs.forEach((c) => c.setSimState(undefined))}>
            Clear
        </button>
    );
}
