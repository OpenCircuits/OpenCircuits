import {TimedComponent} from "digital/models/ioobjects/TimedComponent";

import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";


export const PauseButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text="Pause"
        alt="Pause the timed component"
        getDependencies={(s) => (s instanceof TimedComponent ? `${s.isPaused()}` : "-")}
        isActive={(selections) => selections.every(s => s instanceof TimedComponent && !s.isPaused())}
        onClick={(selections) => {
            (selections as TimedComponent[]).forEach(c => c.pause());
        }}
        {...props} />
);

export const ResumeButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text="Resume"
        alt="Resume the timed component"
        getDependencies={(s) => (s instanceof TimedComponent ? `${s.isPaused()}` : "-")}
        isActive={(selections) => selections.every(s => s instanceof TimedComponent && s.isPaused())}
        onClick={(selections) => {
            (selections as TimedComponent[]).forEach(c => c.resume());
        }}
        {...props} />
);
