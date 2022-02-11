import {TimedComponent} from "digital/models/ioobjects/TimedComponent";

import {ButtonPopupModule, UseModuleProps} from "shared/containers/SelectionPopup/modules/Module";


export const PauseResumeButtonModule = (props: UseModuleProps) => (
    <ButtonPopupModule
        text={(selections) =>
            (selections as TimedComponent[]).every(s => s.isPaused()) ? "Resume" : "Pause"
        }
        alt="Resume/Pause the timed component"
        getDependencies={(s) => (s instanceof TimedComponent ? `${s.isPaused()}` : "-")}
        isActive={(selections) => selections.every(s => s instanceof TimedComponent)}
        onClick={(selections) => {
            const allPaused = selections.every(s => (s as TimedComponent).isPaused());
            (selections as TimedComponent[]).forEach(c => {
                if (allPaused)
                    c.resume();
                else
                    c.pause();
            });
        }}
        {...props} />
);
