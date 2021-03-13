import {connect} from "react-redux";

import {Overlay} from "shared/components/Overlay";
import {Popup} from "shared/components/Popup";

import {SharedAppState}    from "shared/state";
import {CloseHeaderPopups} from "shared/state/Header/actions";
import {HeaderPopups}      from "shared/state/Header/state";

// import {ExpressionToCircuit} from "app/digital/utils";


type OwnProps = {}
type StateProps = {
    curPopup: HeaderPopups;
}
type DispatchProps = {
    CloseHeaderPopups: typeof CloseHeaderPopups;
}

type Props = StateProps & DispatchProps & OwnProps;
const _ExprToCircuitPopup = ({curPopup, CloseHeaderPopups}: Props) => (
    <Popup title="Boolean Expression to Circuit"
           isOpen={(curPopup === "expr_to_circuit")}
           close={CloseHeaderPopups}>
        <h2>Test</h2>
        <div title="Generate Circuit">
            <img src="img/icons/download.svg" height="100%" alt="Download current scene"/>
            <span>Test</span>
        </div>
    </Popup>
);

export const ExprToCircuitPopup = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ curPopup: state.header.curPopup }),
    { CloseHeaderPopups }
)(_ExprToCircuitPopup);
