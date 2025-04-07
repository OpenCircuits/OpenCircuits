import {CreateCircuit} from "digital/api/circuit/public";
import {OpenICDesigner} from "digital/site/state/ICDesigner";
import {CalculateICDisplay} from "digital/site/utils/CircuitUtils";
import {useDigitalDispatch} from "digital/site/utils/hooks/useDigital";
import {Circuit, Component} from "shared/api/circuit/public";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    circuit: Circuit;
}
export const CreateICButtonModule = ({ circuit }: Props) => {
    const dispatch = useDigitalDispatch();

    const [props, cs] = useSelectionProps(
        circuit,
        (s): s is Component => (s.baseKind === "Component"),
        (s) => ({ ids: s.id })
    );

    if (!props)
        return null;

    const isValid = true; // ICData.IsValid(cs);

    const open = () => {
        if (!isValid)
            return;
        dispatch(OpenICDesigner(props["ids"]));
    }

    return (
        <button type="button"
                title="Create an IC from selections"
                disabled={!isValid}
                onClick={open}>
            Create IC
        </button>
    );
}
