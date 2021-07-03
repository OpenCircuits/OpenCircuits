import {useState} from "react";
import {connect}  from "react-redux";

import {CreateAddGroupAction} from "core/actions/addition/AddGroupActionFactory";

import {Overlay} from "shared/components/Overlay";
import {Popup}   from "shared/components/Popup";

import {SharedAppState}    from "shared/state";
import {CloseHeaderPopups} from "shared/state/Header/actions";
import {HeaderPopups}      from "shared/state/Header/state";

import {Camera} from "math/Camera";

import {OrganizeMinDepth} from "core/utils/ComponentOrganizers";

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
        ExpressionToCircuit}    from "digital/utils/ExpressionParser";
import {FormatMap,
        FormatProps}    from "digital/utils/ExpressionParserConstants";

import "./index.scss";


type OwnProps = {
    info: DigitalCircuitInfo;
}
type StateProps = {
    curPopup: HeaderPopups;
}
type DispatchProps = {
    CloseHeaderPopups: typeof CloseHeaderPopups;
}

const Inputs = new Map<string, () => DigitalComponent>([
    ["Constant Low", () => new ConstantLow()],
    ["Constant High", () => new ConstantHigh()],
    ["Button", () => new Button()],
    ["Clock", () => new Clock()],
    ["Switch", () => new Switch()],
]);


function generate(info: DigitalCircuitInfo, expression: string,
                  isIC: boolean, input: string, format: string) {
    const ops = FormatMap.get(format);
    const opsSet = new Set([ops.get("|"), ops.get("^"), ops.get("&"), ops.get("!"), ops.get("("), ops.get(")")]);
    const tokenList = GenerateTokens(expression, ops);
    const inputMap = new Map<string, DigitalComponent>();
    let token: string;
    for(let i = 0; i < tokenList.length; i++) {
        token = tokenList[i];
        if (opsSet.has(token))
            continue;
        inputMap.set(token, Inputs.get(input).call(null));
        inputMap.get(token).setName(token);
    }
    const o = new LED();
    o.setName("Output");
    const circuit = ExpressionToCircuit(inputMap, expression, o, ops);
    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    OrganizeMinDepth(circuit, startPos);
    const action = new GroupAction([CreateDeselectAllAction(info.selections)]);
    if (isIC) {
        const data = new ICData(circuit);
        data.setName(expression);
        const ic = new IC(data);
        ic.setName(expression);
        ic.setPos(info.camera.getPos());
        action.add(new CreateICDataAction(data, info.designer));
        action.add(new PlaceAction(info.designer, ic));
        action.add(new SelectAction(info.selections, ic));
    }
    else {
        action.add(CreateAddGroupAction(info.designer, circuit));
        action.add(CreateGroupSelectAction(info.selections, circuit.getComponents()));
    }
    info.history.add(action.execute());
    info.renderer.render();
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

            const inputTypes = Array.from(Inputs.keys()).map((input) =>
                <option key={input} value={input}>{input}</option>
            );

            const formats = Array.from(FormatMap.entries()).map((formatEntry) =>
                <>
                    <input type="radio" id={formatEntry[0]} name="format" checked={format === formatEntry[0]} onChange={() => setFormat(formatEntry[0])} value={formatEntry[0]} />
                    <label htmlFor={formatEntry[0]}>{formatEntry[1].get("label")}</label><br/>
                </>
            );

            return (
                <Popup title="Digital Expression To Circuit Generator"
                       isOpen={(curPopup === "expr_to_circuit")}
                       close={CloseHeaderPopups}>
                    <div className="exprtocircuit__popup">
                        { errorMessage && <p className="errorMessage">{"ERROR: " + errorMessage}</p> }
                        <input title="Enter Circuit Expression" type="text"
                                   value={expression}
                                   placeholder="!a | (B^third)"
                                   onChange={e => setExpression({expression: e.target.value})} />
                        <br/>

                        <div className="exprtocircuit__popup__settings">
                            <div>
                                <h3>Notation</h3>
                                {formats}
                            </div>
                
                            <div>
                                <h3>Options</h3>
                                <input onChange={() => setIsIC(!isIC)} checked={isIC} type="checkbox" id="isIC" name="isIC" />
                                <label htmlFor="isIC">Generate into IC</label>

                                <br/>
                                <br/>

                                <label>Input Component Type:  </label>
                                <select id="input"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onBlur={e => setInput(e.target.value)}>
                                    {inputTypes}
                                </select>
                            </div>

                        </div>

                        { expression !== "" &&
                            <button className="exprtocircuit__popup__generate" type="button" onClick={() => {
                                try {
                                    generate(info, expression, isIC, input, format);
                                    setExpression({ expression: "" });
                                    setErrorMessage({ errorMessage: "" });
                                    CloseHeaderPopups();
                                }
                                catch (err) {
                                    setErrorMessage({ errorMessage: err.message });
                                }
                            }}>Generate</button>
                        }

                        <button className="cancel" type="button" onClick={() => {
                            setExpression({ expression: "" });
                            setErrorMessage({ errorMessage: "" });
                            CloseHeaderPopups();
                        }}>Cancel</button>

                    </div>
                </Popup>
            );
        }
    );
})();
