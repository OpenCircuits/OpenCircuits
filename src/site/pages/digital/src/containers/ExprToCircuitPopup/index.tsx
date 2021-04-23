import {useState} from "react";
import {connect} from "react-redux";

import {CreateAddGroupAction}    from "core/actions/addition/AddGroupActionFactory";

import {Overlay} from "shared/components/Overlay";
import {Popup} from "shared/components/Popup";

import {SharedAppState}    from "shared/state";
import {CloseHeaderPopups} from "shared/state/Header/actions";
import {HeaderPopups}      from "shared/state/Header/state";

import {Camera} from "math/Camera";

import {OrganizeComponents} from "core/utils/ComponentUtils";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";
import {DigitalComponent} from "digital/models/DigitalComponent";
import {ICData} from "digital/models/ioobjects/other/ICData";
import {IC} from "digital/models/ioobjects/other/IC";
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

function generate(designer: DigitalCircuitDesigner, camera: Camera, expression: string, isIC: boolean) {
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
            if(!inputMap.has(token)) {
                inputMap.set(token, new Switch());
                inputMap.get(token).setName(token);
            }
            break;
        }
    }
    const o = new LED();
    o.setName("Output");
    const circuit = ExpressionToCircuit(inputMap, expression, o);
    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    const startPos = camera.getPos().sub(camera.getCenter().scale(camera.getZoom()/1.5));
    OrganizeComponents(circuit, startPos);
    if (isIC) {
        const ic = new IC(new ICData(circuit));
        designer.addObject(ic);
    }
    else {
        CreateAddGroupAction(designer, circuit).execute();
    }
}

type Props = StateProps & DispatchProps & OwnProps;

export const ExprToCircuitPopup = (() => {

    return connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
        (state) => ({ curPopup: state.header.curPopup }),
        { CloseHeaderPopups },
    )(
        ({curPopup, CloseHeaderPopups, info}: Props) => {
            const [{expression}, setExpression] = useState({ expression: "" });
            const [{errorMessage}, setErrorMessage] = useState({ errorMessage: "" });
            const [isIC, setIsIC] = useState(false);

            return (
                <Popup title="Boolean Expression to Circuit"
                       isOpen={(curPopup === "expr_to_circuit")}
                       close={CloseHeaderPopups}>
                    { errorMessage && <p>{errorMessage}</p> }
                    <input title="Enter Circuit Expression" type="text"
                               value={expression}
                               placeholder=""
                               onChange={e => setExpression({expression: e.target.value})} />
                    <input onChange={() => setIsIC(!isIC)} checked={isIC} type="checkbox" />
                    <div title="Generate Circuit">
                        <button type="button" onClick={() => {
                            try {
                                generate(info.designer, info.camera, expression, isIC);
                                setExpression({ expression: "" });
                                setErrorMessage({ errorMessage: "" });
                                CloseHeaderPopups();
                            }
                            catch (err) {
                                setErrorMessage({ errorMessage: err.message });
                            }
                        }}>Generate</button>
                    </div>
                </Popup>
            );
        }
    );
})();
