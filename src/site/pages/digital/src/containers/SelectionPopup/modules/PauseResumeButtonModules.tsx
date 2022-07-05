import {CircuitInfo} from "core/utils/CircuitInfo";

import {TimedComponent} from "digital/models/ioobjects/TimedComponent";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    info: CircuitInfo;
}
export const PauseResumeButtonModule = ({ info }: Props) => {
    const { renderer } = info;

    const [props, ts, forceUpdate] = useSelectionProps(
        info,
        (s): s is TimedComponent => (s instanceof TimedComponent),
        (s) => ({ isPaused: s.isPaused() })
    );

    if (!props)
        return null;

    const allPaused = (props.isPaused as boolean[]).every(Boolean);

    return (
        <button type="button"
                title="Resume/Pause the timed component"
                onClick={() => {
                    ts.forEach(t => (allPaused ? t.resume() : t.pause()));
                    renderer.render();
                    forceUpdate(); // Need to force an update since this isn't changed by an action
                }}>
            {allPaused ? "Resume" : "Pause"}
        </button>
    );
}
