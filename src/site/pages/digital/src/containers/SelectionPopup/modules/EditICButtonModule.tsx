import {IC} from "digital/models/ioobjects";
import {InputPort} from "digital/models/ports/InputPort";

import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";

import {useDigitalDispatch} from "site/digital/utils/hooks/useDigital";
import {OpenICEditor} from "site/digital/state/ICEditor";


export const EditICButtonModule = (props: UseModuleProps) => {
    const dispatch = useDigitalDispatch();

    return (
        <ButtonPopupModule
            text="Edit IC"
            alt="Edit the inside of this IC"
            getDependencies={(s) => (s instanceof InputPort ? ""+s.getWires().length : "")}
            isActive={(selections) => {
                return selections.length === 1 && selections[0] instanceof IC;
            }}
            onClick={(selections) => {
                dispatch(OpenICEditor((selections[0]as IC).getData()));
            }}
            {...props} />
    );
}
