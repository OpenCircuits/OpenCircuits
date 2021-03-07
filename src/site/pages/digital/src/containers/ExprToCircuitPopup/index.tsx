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
const _ExprToCircuitPopup = ({curPopup, CloseHeaderPopups}: Props) => (
    <Popup title="Boolean Expression to Circuit"
           isOpen={(curPopup === "expr_to_circuit")}
           close={CloseHeaderPopups}>
        <h2>Basic Interactions</h2>
    </Popup>
);

export const ExprToCircuitPopup = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ curPopup: state.header.curPopup }),
    { CloseHeaderPopups }
)(_ExprToCircuitPopup);
