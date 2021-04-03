import {useState} from "react";
import {connect} from "react-redux";

import {CreateAddGroupAction}    from "core/actions/addition/AddGroupActionFactory";

import {Overlay} from "shared/components/Overlay";
import {Popup} from "shared/components/Popup";

import {SharedAppState}    from "shared/state";
import {CloseHeaderPopups} from "shared/state/Header/actions";
import {HeaderPopups}      from "shared/state/Header/state";

import {OrganizeComponents} from "core/utils/ComponentUtils";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {LED} from "digital/models/ioobjects/outputs/LED";
import {Switch} from "digital/models/ioobjects/inputs/Switch";
import {GenerateTokens, ExpressionToCircuit} from "digital/utils/ExpressionParser";


type OwnProps = {
    info: DigitalCircuitInfo;
}
type StateProps = {
    curPopup: HeaderPopups;
}
type DispatchProps = {
    CloseHeaderPopups: typeof CloseHeaderPopups;
}

function generate(designer: DigitalCircuitDesigner, expression: string) {
    const tokenList = GenerateTokens(expression);
    const inputMap = new Map<string, DigitalComponent>();
    let token: string;
    for(let i = 0; i < tokenList.length; i++) {
        token = tokenList[i];
        switch(token) {
        case "(":
        case ")":
        case "&":
        case "^":
        case "|":
        case "!":
            break;
        default:
            if(!inputMap.has(token))
                inputMap.set(token, new Switch());
            break;
        }
    }
    const o = new LED();
    const circuit = ExpressionToCircuit(inputMap, expression, o)
    CreateAddGroupAction(designer, circuit).execute();
    OrganizeComponents(circuit);
}

type Props = StateProps & DispatchProps & OwnProps;

export const ExprToCircuitPopup = (() => {

    return connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
        (state) => ({ curPopup: state.header.curPopup }),
        { CloseHeaderPopups },
    )(
        ({curPopup, CloseHeaderPopups, info}: Props) => {
            const [{expression}, setExpression] = useState({ expression: "" });

            return (
                <Popup title="Boolean Expression to Circuit"
                       isOpen={(curPopup === "expr_to_circuit")}
                       close={CloseHeaderPopups}>
                    <input title="Enter Circuit Expression" type="text"
                               value={expression}
                               placeholder=""
                               onChange={e => setExpression({expression: e.target.value})} />
                    <div title="Generate Circuit">
                        <button type="button" onClick={() => {generate(info.designer, expression); CloseHeaderPopups();} } >Generate</button>
                    </div>
                </Popup>
            );
        }
    );
})();
