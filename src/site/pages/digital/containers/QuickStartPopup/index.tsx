import {connect} from "react-redux";

import {Overlay} from "shared/components/Overlay";
import {Popup} from "shared/components/Popup";

import {SharedAppState}    from "shared/state";
import {CloseHeaderPopups} from "shared/state/Header/actions";
import {HeaderPopups}      from "shared/state/Header/state";


type OwnProps = {}
type StateProps = {
    curPopup: HeaderPopups;
}
type DispatchProps = {
    CloseHeaderPopups: typeof CloseHeaderPopups;
}

type Props = StateProps & DispatchProps & OwnProps;
const _QuickStartPopup = ({curPopup, CloseHeaderPopups}: Props) => (
    <Popup title="Quick Start"
           isOpen={(curPopup === "quick_start")}
           close={CloseHeaderPopups}>
        <h2>Basic Interactions</h2>
        <ul>
            <li><b>Placement</b>: Click or drag an item from the ItemNav to place it into the circuit.</li>
            <li><b>Wiring</b>: Click on or drag two ports to wire them together.</li>
            <li><b>Pan</b>: Hold the ALT/OPTION key or Middle Mouse and click to pan the camera.</li>
            <li><b>Translate</b>: Click and drag on an object in the circuit to move it around.</li>
            <li><b>Rotate</b>: Select some objects and click the red circle to rotate them.</li>
            <li><b>Splitting wires</b>: Click and drag on an existing wire to split it at that point.</li>
        </ul>
        <h2>Advanced Interactions</h2>
        <ul>
            <li><b>Snap Objects to Grid</b>: While translating objects, holding down shift will snap the objects to the grid.</li>
            <li><b>Snap Objects to Rotations</b>: While rotating objects, holding down shift will snap the objects to 45&#176; rotations.</li>
            <li><b>Snap Wires</b>: When splitting a wire, you can move the WirePort to positions aligned with the outgoing and incoming ports to snap the wire.</li>
            <li><b>Bus</b>: To bus a group of ports together, simply select an equal number of input/output ports and then press the 'Bus' button.</li>
            <li><b>Quick Duplicate Group</b>: To quickly duplicate a group of selected objects, begin Translating them and then press the Spacebar.</li>
        </ul>
    </Popup>
);

export const QuickStartPopup = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ curPopup: state.header.curPopup }),
    { CloseHeaderPopups }
)(_QuickStartPopup);
