import {useState} from "react";

import {DigitalCircuitInfo}  from "digital/utils/DigitalCircuitInfo";
import {OperatorFormat, OperatorFormatLabel} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {Formats} from "digital/utils/ExpressionParser/Constants/Formats";

import {Popup}        from "shared/components/Popup";
import {ButtonToggle} from "shared/components/ButtonToggle";
import {InputField} from "shared/components/InputField";

import {CloseHeaderPopups} from "shared/state/Header";
import {useSharedDispatch,
        useSharedSelector} from "shared/utils/hooks/useShared";

import {InputTypes,
        Generate,
        ExprToCirGeneratorOptions,
        OutputTypes}    from "./generate";
import {CustomOps}      from "./CustomOps";
import {BooleanOption}  from "./BooleanOption";
import {DropdownOption} from "./DropdownOption";

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
    const [clocksToOscope, setClocksToOscope] = useState(false);
    const [label, setLabel] = useState(false);
    const [input, setInput] = useState<InputTypes>("Switch");
    const [output, setOutput] = useState<OutputTypes>("LED");
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
                <InputField title="Enter Circuit Expression"
                            type="text"
                            value={expression}
                            placeholder="!a | (B^third)"
                            onChange={e => setExpression(e.target.value)}
                            spellCheck={false} />
                <br/>

                <div className="exprtocircuit__popup__settings">
                    <div>
                        <h3>Notation</h3>
                        {Formats.map(curFormat =>
                            <ButtonToggle key={curFormat.icon}
                                          isOn={format === curFormat.icon} text={curFormat.label} height="40px"
                                          onChange={() => setFormat(curFormat.icon)} />
                        )}
                        <ButtonToggle isOn={format === "custom"} text={"Custom"} height="40px"
                                      onChange={() => setFormat("custom")} />
                        {
                            format === "custom" &&
                            <CustomOps customOps={customOps} setCustomOps={setCustomOps} />
                        }
                    </div>

                    <div>
                        <h3>Options</h3>
                        <BooleanOption displayCondition={true}
                                       option={label}
                                       setOption={setLabel}
                                       text="Place labels for inputs" />
                        <BooleanOption displayCondition={output !== "Oscilloscope"}
                                       option={isIC}
                                       setOption={setIsIC}
                                       text="Generate into IC" />
                        <BooleanOption displayCondition={output === "Oscilloscope" && input === "Clock"}
                                       option={clocksToOscope}
                                       setOption={setClocksToOscope}
                                       text="Connect Clocks to Oscilloscope" />
                        <DropdownOption id="input"
                                        option={input}
                                        options={["Button", "Clock", "Switch"]}
                                        setOption={setInput}
                                        text="Input Component Type:  " />
                        <br />
                        <DropdownOption id="output"
                                        option={output}
                                        options={["LED", "Oscilloscope"]}
                                        setOption={setOutput}
                                        text="Output Component Type:  " />
                    </div>
                </div>

                <button className="exprtocircuit__popup__generate" type="button" disabled={expression===""} onClick={() => {
                    try {
                        Generate(mainInfo, expression, {
                            input, output, isIC,
                            connectClocksToOscope: clocksToOscope,
                            label, format,
                            ops: customOps,
                        });
                        reset();
                    } catch (err) {
                        setErrorMessage(err.message);
                        console.error(err);
                    }
                }}>Generate</button>

                <button className="cancel" type="button" onClick={() => reset()}>Cancel</button>

            </div>

        </Popup>
    );
});
