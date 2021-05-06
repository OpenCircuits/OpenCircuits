import {useState} from "react";
import {connect}  from "react-redux";

import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";

import {Overlay} from "shared/components/Overlay";
import {Popup}   from "shared/components/Popup";

import {SharedAppState}    from "shared/state";
import {CloseHeaderPopups} from "shared/state/Header/actions";
import {HeaderPopups}      from "shared/state/Header/state";

import {Camera} from "math/Camera";

import {OrganizeComponents} from "core/utils/ComponentUtils";

import {GroupAction}             from "core/actions/GroupAction";
import {CreateDeselectAllAction,
        CreateGroupSelectAction,
        SelectAction,}            from "core/actions/selection/SelectAction";
import {PlaceAction}             from "core/actions/addition/PlaceAction";
import {CreateICDataAction}      from "digital/actions/CreateICDataAction";

import {DigitalCircuitInfo}     from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";
import {DigitalComponent}       from "digital/models/DigitalComponent";
import {ICData}                 from "digital/models/ioobjects/other/ICData";
import {IC}                     from "digital/models/ioobjects/other/IC";
import {LED}                    from "digital/models/ioobjects/outputs/LED";
import {ConstantLow}            from "digital/models/ioobjects/inputs/ConstantLow";
import {ConstantHigh}           from "digital/models/ioobjects/inputs/ConstantHigh";
import {Button}                 from "digital/models/ioobjects/inputs/Button";
import {Switch}                 from "digital/models/ioobjects/inputs/Switch";
import {Clock}                  from "digital/models/ioobjects/inputs/Clock";
import {GenerateTokens,
        FormatExpression,
        ExpressionToCircuit}    from "digital/utils/ExpressionParser";

import "./index.css";


type OwnProps = {
    info: DigitalCircuitInfo;
}
type StateProps = {
    curPopup: HeaderPopups;
}
type DispatchProps = {
    CloseHeaderPopups: typeof CloseHeaderPopups;
}

function generate(designer: DigitalCircuitDesigner, info: DigitalCircuitInfo,
                  expression: string, isIC: boolean, input: string, format: string) {
    expression = FormatExpression(expression, format);
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
                switch(input) {
                case "Constant Low":
                    inputMap.set(token, new ConstantLow());
                    break;
                case "Constant High":
                    inputMap.set(token, new ConstantHigh());
                    break;
                case "Button":
                    inputMap.set(token, new Button());
                    break;
                case "Clock":
                    inputMap.set(token, new Clock());
                    break;
                case "Switch":
                default:
                    inputMap.set(token, new Switch());
                    break;
                }
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
    const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    OrganizeComponents(circuit, startPos);
    if (isIC) {
        const data = new ICData(circuit);
        data.setName(expression);
        const ic = new IC(data);
        ic.setName(expression);
        ic.setPos(info.camera.getPos());
        const action = new GroupAction([
            CreateDeselectAllAction(info.selections),
            new CreateICDataAction(data, info.designer),
            new PlaceAction(info.designer, ic),
            new SelectAction(info.selections, ic)
        ]);
        info.history.add(action.execute());
        info.renderer.render();
    }
    else {
        const action = new GroupAction([
            CreateDeselectAllAction(info.selections),
            CreateAddGroupAction(designer, circuit),
            CreateGroupSelectAction(info.selections, circuit.getComponents())
        ]);
        info.history.add(action.execute());
        info.renderer.render();
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
            const [input, setInput] = useState("Switch");
            const [format, setFormat] = useState("|");

            return (
                <Popup title="Boolean Expression to Circuit"
                       isOpen={(curPopup === "expr_to_circuit")}
                       close={CloseHeaderPopups}>
                    { errorMessage && <p>{errorMessage}</p> }
                    <input title="Enter Circuit Expression" type="text"
                               value={expression}
                               placeholder="!a | (B^third)"
                               onChange={e => setExpression({expression: e.target.value})} />
                    <select id="input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onBlur={e => setInput(e.target.value)}>
                        <option key="Constant Low" value="Constant Low">Constant Low</option>
                        <option key="Constant High" value="Constant High">Constant High</option>
                        <option key="Button" value="Button">Button</option>
                        <option key="Switch" value="Switch" selected>Switch</option>
                        <option key="Clock" value="Clock">Clock</option>
                    </select>
                    <select id="format"
                            value={format}
                            onChange={e => setFormat(e.target.value)}
                            onBlur={e => setFormat(e.target.value)}>
                        <option key="|" value="|" selected>&amp;, |, ^</option>
                        <option key="||" value="||">&amp;&amp;, ||, ^</option>
                        <option key="+" value="+">*, +, ^</option>
                    </select>
                    <input onChange={() => setIsIC(!isIC)} checked={isIC} type="checkbox" />
                    <div title="Generate Circuit">
                        <button type="button" onClick={() => {
                            try {
                                generate(info.designer, info, expression, isIC, input, format);
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
