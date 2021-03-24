import {connect} from "react-redux";

import {CreateAddGroupAction}    from "core/actions/addition/AddGroupActionFactory";

import {Overlay} from "shared/components/Overlay";
import {Popup} from "shared/components/Popup";

import {SharedAppState}    from "shared/state";
import {CloseHeaderPopups} from "shared/state/Header/actions";
import {HeaderPopups}      from "shared/state/Header/state";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";
import {LED} from "digital/models/ioobjects/outputs/LED";
import {Switch} from "digital/models/ioobjects/inputs/Switch";
import {ExpressionToCircuit} from "digital/utils/ExpressionParser";


type OwnProps = {
    info: DigitalCircuitInfo;
}
type StateProps = {
    curPopup: HeaderPopups;
}
type DispatchProps = {
    CloseHeaderPopups: typeof CloseHeaderPopups;
}

function generate(designer: DigitalCircuitDesigner) {
    const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
    const inputMap = new Map([
        ["a", a],
        ["b", b],
        ["c", c]
    ]);
    CreateAddGroupAction(designer, ExpressionToCircuit(inputMap, "a|b&c", o)).execute();
}

type Props = StateProps & DispatchProps & OwnProps;
const _ExprToCircuitPopup = ({curPopup, CloseHeaderPopups, info}: Props) => (
    <Popup title="Boolean Expression to Circuit"
           isOpen={(curPopup === "expr_to_circuit")}
           close={CloseHeaderPopups}>
        <h2>Test</h2>
        <div title="Generate Circuit">
            <button type="button" onClick={() => generate(info.designer) } >Generate</button>
            <span>Test</span>
        </div>
    </Popup>
);

export const ExprToCircuitPopup = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ curPopup: state.header.curPopup }),
    { CloseHeaderPopups },
)(_ExprToCircuitPopup);
