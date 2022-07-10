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

    return (
        <button type="button"
                title="View the inside of this IC"
                onClick={() => dispatch(OpenICViewer(ics[0]))}>
            View IC
        </button>
    );
}
