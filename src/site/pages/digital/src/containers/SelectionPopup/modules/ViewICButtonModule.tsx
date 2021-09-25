import {IC} from "digital/models/ioobjects";
import {InputPort} from "digital/models/ports/InputPort";

import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";

import {useDigitalDispatch} from "site/digital/utils/hooks/useDigital";
import {OpenICViewer} from "site/digital/state/ICViewer";


export const ViewICButtonModule = (props: UseModuleProps) => {
    const dispatch = useDigitalDispatch();

    return (
        <ButtonPopupModule
            text="View IC"
            alt="View the inside of this IC"
            getDependencies={(s) => (s instanceof InputPort ? ""+s.getWires().length : "")}
            isActive={(selections) => {
                return selections.length === 1 && selections[0] instanceof IC;
            }}
            onClick={(selections) => {
                dispatch(OpenICViewer((selections[0]as IC).getData()));
            }}
            {...props} />
    );
}
