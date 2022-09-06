import {CircuitInfo} from "core/utils/CircuitInfo";

import {Clock} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";


type Props = {
    info: CircuitInfo;
}
export const ClockSyncButtonModule = ({ info }: Props) => {
    const { renderer } = info;

    const [props, cs, forceUpdate] = useSelectionProps(
        info,
        (s): s is Clock => (s instanceof Clock),
        (_) => ({ isClock: true }) // Don't really need any props but
                                   //  we need to be able to update the state
    );

    // Show if valid and if there are multiple clocks
    if (!props || props.isClock.length < 2)
        return null;

    return (
        <button type="button"
                title="Sychronize start of selected clocks"
                onClick={() => {
                    cs.forEach((c) => c.reset());
                    renderer.render();
                    forceUpdate(); // Need to force an update since this isn't changed by an action
                }}>
            Sync Clocks
        </button>
    );
}
