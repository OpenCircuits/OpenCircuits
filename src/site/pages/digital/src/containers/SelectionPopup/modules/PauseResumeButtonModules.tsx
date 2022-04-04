import {CircuitInfo} from "core/utils/CircuitInfo";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {TimedComponent} from "digital/models/ioobjects/TimedComponent";


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

    const allPaused = props.isPaused.every(Boolean);

    return <button
        title="Resume/Pause the timed component"
        onClick={() => {
            ts.forEach(t => (allPaused ? t.resume() : t.pause()));
            renderer.render();
            forceUpdate(); // Need to force an update since this isn't changed by an action
        }}>
        {allPaused ? "Resume" : "Pause"}
    </button>
}
