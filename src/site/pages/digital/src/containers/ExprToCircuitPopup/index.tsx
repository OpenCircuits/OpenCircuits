import {useState} from "react";

import {Popup} from "shared/components/Popup";

import {CloseHeaderPopups} from "shared/state/Header";
import {useSharedDispatch,
        useSharedSelector} from "shared/utils/hooks/useShared";

import {TokenType} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {Formats}   from "digital/utils/ExpressionParser/Constants/Objects";

import {DigitalCircuitInfo}  from "digital/utils/DigitalCircuitInfo";

import {Generate} from "./generate";

import "./index.scss";


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
    const [input, setInput] = useState("Switch");
    const [format, setFormat] = useState("|");
    const [userOps, setUserOps] = useState({...Formats[0], icon: "custom"});

    function reset() {
        setExpression("");
        setErrorMessage("");
        dispatch(CloseHeaderPopups());
    }

    const customOps: [string, TokenType][] = [
        ["AND", "&"],
        ["OR", "|"],
        ["XOR", "^"],
        ["NOT", "!"],
        ["(", "("],
        [")", ")"],
    ];

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
                            <div key={curFormat.icon}>
                                <input type="radio" id={curFormat.icon} name="format" checked={format === curFormat.icon}
                                       onChange={() => setFormat(curFormat.icon)} value={curFormat.icon} />
                                <label htmlFor={curFormat.icon}>{curFormat.label}</label><br/>
                            </div>
                        )}
                        <div>
                            <input type="radio" name="format" checked={format === "custom"} onChange={() => setFormat("custom")} value={"custom"} />
                            <label htmlFor={"custom"}>Custom</label><br/>
                        </div>
                        {
                            format === "custom" &&
                            <div>
                                {customOps.map((op) => 
                                    <div className="exprtocircuit__popup__customOps" key={op[0]}>
                                        <input title={"Enter symbol for " + op[0]} type="text" value={userOps.ops[op[1]]}
                                               onChange={e => setUserOps({...userOps, ops: {...userOps.ops, [op[1]]: e.target.value}})}/>
                                        <label htmlFor={userOps.ops[op[1]]}>Custom {op[0]}: "{userOps.ops[op[1]]}"</label>
                                    </div>
                                )}
                                <div className="exprtocircuit__popup__customOps" key="separator">
                                    <input title="Enter symbol for Separator" type="text" value={userOps.separator}
                                           onChange={e => setUserOps({...userOps, separator: e.target.value})}/>
                                    <label htmlFor={userOps.separator}>Custom Separator: "{userOps.separator}"</label>
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <h3>Options</h3>
                        <input id="isIC" type="checkbox" name="isIC" checked={isIC} onChange={() => setIsIC(!isIC)} />
                        <label htmlFor="isIC">Generate into IC</label>
                        <br/>
                        <br/>
                        <label>Input Component Type:  </label>
                        <select id="input"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onBlur={e => setInput(e.target.value)}>

                            {["Button", "Clock", "Switch"].map(input =>
                                <option key={input} value={input}>{input}</option>
                            )}

                        </select>
                    </div>
                </div>

                <button className="exprtocircuit__popup__generate" type="button" disabled={expression===""} onClick={() => {
                    try {
                        Generate(mainInfo, expression, isIC, input, format, userOps);
                        reset();
                    } catch (err) {
                        setErrorMessage(err.message);
                    }
                }}>Generate</button>

                <button className="cancel" type="button" onClick={() => reset()}>Cancel</button>

            </div>

        </Popup>
    );
});
