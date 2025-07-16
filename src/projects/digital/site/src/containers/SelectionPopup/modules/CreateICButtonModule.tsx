import {OpenICDesigner} from "digital/site/state/ICDesigner";
import {ICValidationStatus, IsValidIC} from "digital/site/utils/ICValidation";
import {useDigitalDispatch} from "digital/site/utils/hooks/useDigital";
import {useState} from "react";
import {Circuit, Component} from "shared/api/circuit/public";
import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";

// No error message for Valid (which is set to 0)
const errorMessages: Record<Exclude<ICValidationStatus, 0>, string> = {
    [ICValidationStatus.NoOutput]:                "Selection must contain an output",
    [ICValidationStatus.NoInput]:                 "Selection must contain an input",
    [ICValidationStatus.Incomplete]:              "Selection must contain only complete circuits",
    [ICValidationStatus.ContainsTimedComponents]: "Selection must not contain Clocks or Oscilloscopes",
    [ICValidationStatus.ContainsSegmentDisplays]: "Selection must not contain Segment Displays",
    [ICValidationStatus.Empty]:                   "Selection must contain functional components",
}
type Props = {
    circuit: Circuit;
}
export const CreateICButtonModule = ({ circuit }: Props) => {
    const dispatch = useDigitalDispatch();
    const [showError, setShowError] = useState(false);

    const [props, cs] = useSelectionProps(
        circuit,
        (s): s is Component => (s.baseKind === "Component"),
        (s) => ({ ids: s.id })
    );

    const icValidationStatus = IsValidIC(cs);

    if (!props)
        return;

    const open = () => {
        if (icValidationStatus !== ICValidationStatus.Valid)
            setShowError(true);
        else
            dispatch(OpenICDesigner(props["ids"]));
    }

    return (
        <button type="button"
                title="Create an IC from selections"
                onBlur={() => setShowError(false)}
                onClick={open}>
            Create IC
            {icValidationStatus !== ICValidationStatus.Valid && showError &&
                (<span className="tooltip">
                    {errorMessages[icValidationStatus]}
                </span>)}

        </button>
    );
}
