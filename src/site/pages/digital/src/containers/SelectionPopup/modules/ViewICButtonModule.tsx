import {CircuitInfo} from "core/utils/CircuitInfo";

import {IC} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {useDigitalDispatch} from "site/digital/utils/hooks/useDigital";
import {OpenICViewer} from "site/digital/state/ICViewer";


type Props = {
    info: CircuitInfo;
}
export const ViewICButtonModule = ({ info }: Props) => {
    const [props, ics] = useSelectionProps(
        info,
        (s): s is IC => (s instanceof IC),
        (_) => ({ isIC: true }) // Don't really need any props but
                                //  we need to be able to update the state
    );

    const dispatch = useDigitalDispatch();

    // Only active when a single IC is selected
    if (!(props && ics.length === 1))
        return null;

    return <button
        title="View the inside of this IC"
        onClick={() => dispatch(OpenICViewer(ics[0]))}>
        View IC
    </button>
}

// export const ViewICButtonModule = (props: UseModuleProps) => {
//     const dispatch = useDigitalDispatch();

//     return (
//         <ButtonPopupModule
//             text="View IC"
//             alt="View the inside of this IC"
//             getDependencies={(s) => (s instanceof InputPort ? ""+s.getWires().length : "")}
//             isActive={(selections) => {
//                 return selections.length === 1 && selections[0] instanceof IC;
//             }}
//             onClick={(selections) => {
//                 dispatch(OpenICViewer((selections[0]as IC).getData()));
//             }}
//             {...props} />
//     );
//     return (
//         <ButtonPopupModule
//             text="View IC"
//             alt="View the inside of this IC"
//             getDependencies={(s) => (s instanceof InputPort ? ""+s.getWires().length : "")}
//             isActive={(selections) => {
//                 return selections.length === 1 && selections[0] instanceof IC;
//             }}
//             onClick={(selections) => {
//                 dispatch(OpenICViewer(selections[0]as IC));
//             }}
//             {...props} />
//     );
// }
