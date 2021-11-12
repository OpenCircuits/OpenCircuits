import {useState} from "react";

import {OperatorFormat, OperatorFormatLabel, TokenType} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {Formats} from "digital/utils/ExpressionParser/Constants/Formats";

import {Popup} from "shared/components/Popup";
import {SwitchToggle} from "shared/components/SwitchToggle";

import {CloseHeaderPopups} from "shared/state/Header";
import {useSharedDispatch,
        useSharedSelector} from "shared/utils/hooks/useShared";

import {DigitalCircuitInfo}  from "digital/utils/DigitalCircuitInfo";

import {Generate} from "./generate";
import {CustomOps} from "./CustomOps";

import "./index.scss";


type InputTypes = "Button" | "Clock" | "Switch";

type Props = {
    mainInfo: DigitalCircuitInfo;
}

export const ExprToCircuitPopup = (({ mainInfo }: Props) => {
    const {curPopup} = useSharedSelector(
        state => ({ curPopup: state.header.curPopup })
    );
    const dispatch = useSharedDispatch();

    const [expression, setExpression] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isIC, setIsIC] = useState(false);
    const [input, setInput] = useState<InputTypes>("Switch");
    const [format, setFormat] = useState<OperatorFormatLabel>("|");
    const [customOps, setCustomOps] = useState<OperatorFormat>({...Formats[0], icon: "custom"});

    function reset() {
        setExpression("");
        setErrorMessage("");
        dispatch(CloseHeaderPopups());
    }

    return (
        <Popup title="Digital Expression To Circuit Generator"
               isOpen={(curPopup === "expr_to_circuit")}
               close={() => dispatch(CloseHeaderPopups())}>
            <div className="exprtocircuit__popup">
                { errorMessage && <p className="exprtocircuit__popup__errorMessage">{"ERROR: " + errorMessage}</p> }
                <input title="Enter Circuit Expression"
                       type="text"
                       value={expression}
                       placeholder="!a | (B^third)"
                       onChange={e => setExpression(e.target.value)} />
                <br/>

                <div className="exprtocircuit__popup__settings">
                    <div>
                        <h3>Notation</h3>
                        {Formats.map(curFormat =>
                            <SwitchToggle key={curFormat.icon} isOn={format === curFormat.icon} text={curFormat.label}
                                          onChange={() => setFormat(curFormat.icon)} hideStateText={true} />
                        )}
                        <SwitchToggle isOn={format === "custom"} text={"Custom"}
                                      onChange={() => setFormat("custom")} hideStateText={true} />
                        {
                            format === "custom" &&
                            <CustomOps customOps={customOps} setCustomOps={setCustomOps} />
                        }
                    </div>

                    <div>
                        <h3>Options</h3>
                        <SwitchToggle isOn={isIC} text={"Generate into IC"} onChange={() => setIsIC(!isIC)} hideStateText={true} />
                        <br/>
                        <br/>
                        <label>Input Component Type:  </label>
                        <select id="input"
                                value={input}
                                onChange={e => setInput(e.target.value as InputTypes)}
                                onBlur={e => setInput(e.target.value as InputTypes)}>

                            {(["Button", "Clock", "Switch"] as InputTypes[]).map(input =>
                                <option key={input} value={input}>{input}</option>
                            )}

                        </select>
                    </div>
                </div>

                <button className="exprtocircuit__popup__generate" type="button" disabled={expression===""} onClick={() => {
                    try {
                        Generate(mainInfo, expression, isIC, input, format, customOps);
                        reset();
                    } catch (err) {
                        setErrorMessage(err.message);
                        console.log(err);
                    }
                }}>Generate</button>

                <button className="cancel" type="button" onClick={() => reset()}>Cancel</button>

            </div>

        </Popup>
    );
});
