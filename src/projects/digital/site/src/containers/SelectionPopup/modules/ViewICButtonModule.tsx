import {OpenICViewer} from "digital/site/state/ICViewer";
import {useDigitalDispatch} from "digital/site/utils/hooks/useDigital";
import {Circuit, Component} from "shared/api/circuit/public";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    circuit: Circuit;
}
export const ViewICButtonModule = ({ circuit }: Props) => {
    const [props, ics] = useSelectionProps(
        circuit,
        (s): s is Component => (s.baseKind === "Component" && !!circuit.getIC(s.kind)),
        (c) => ({ id: c.id }),
    );

    const dispatch = useDigitalDispatch();

    // Only active when a single IC is selected
    if (!(props && ics.length === 1))
        return;

    return (
        <button type="button"
                title="View the inside of this IC"
                onClick={() => dispatch(OpenICViewer(props.id[0]))}>
            View IC
        </button>
    );
}
