import {CircuitInfo} from "core/utils/CircuitInfo";

import {Component} from "core/models";

import {IC, ICData} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {useDigitalDispatch} from "site/digital/utils/hooks/useDigital";
import {OpenICEditor} from "site/digital/state/ICEditor";


// export const EditICButtonModule = (props: UseModuleProps) => {
//     const dispatch = useDigitalDispatch();

//     return (
//         <ButtonPopupModule
//             text="Edit IC"
//             alt="Edit the inside of this IC"
//             getDependencies={(s) => (s instanceof InputPort ? ""+s.getWires().length : "")}
//             isActive={(selections) => {
//                 return selections.length === 1 && selections[0] instanceof IC;
//             }}
//             onClick={(selections) => {
//                 dispatch(OpenICEditor((selections[0]as IC).getData()));
//             }}
//             {...props} />
//     );
// }

type Props = {
    info: CircuitInfo;
}

export const EditICButtonModule = ({ info }: Props) => {
    const dispatch = useDigitalDispatch();

    const [props, ics] = useSelectionProps(
        info,
        (s): s is IC => (s instanceof IC),
        // (s) => ({ name: s.getName() } ),
        (_) => ({ isIC: true })
    );

    if (!(props && ics.length === 1))
        return null;

    return <button
        title="Edit the inside of this IC"
        onClick={() => dispatch(OpenICEditor(ics[0].getData()))}>
        Edit IC
    </button>
}