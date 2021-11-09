import {Clock} from "digital/models/ioobjects";

import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";


export const ClockSyncButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text="Sync Clocks"
        alt="Sychronize start of selected clocks"
        getDependencies={(s) => (s instanceof Clock ? "1" : "0")}
        isActive={(selections) => selections.every(s => s instanceof Clock)}
        onClick={(selections) => {
            (selections as Clock[]).forEach(c => c.reset());
        }}
        {...props} />
);
