import {useState} from "react";

import {OperatorFormat, OperatorFormatLabel} from "digital/site/utils/ExpressionParser/Constants/DataStructures";
import {FORMATS}                             from "digital/site/utils/ExpressionParser/Constants/Formats";

import {DigitalRootCircuit} from "digital/api/circuit/public";

import {useSharedDispatch,
        useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CloseHeaderPopups} from "shared/site/state/Header";

import {ButtonToggle} from "shared/site/components/ButtonToggle";
import {InputField}   from "shared/site/components/InputField";
import {Popup}        from "shared/site/components/Popup";

import {BooleanOption}  from "./BooleanOption";
import {CustomOps}      from "./CustomOps";
import {DropdownOption} from "./DropdownOption";
import {Generate,
        InputTypes,
        OutputTypes}    from "./generate";

import "./index.scss";
import {Camera} from "shared/api/circuitdesigner/public/Camera";


type Props = {
    circuit: DigitalRootCircuit;
    viewport: {camera: Camera};
}
export const ExprToCircuitPopup = (({ circuit, viewport: { camera } }: Props) => {
    const { curPopup } = useSharedSelector(
        (state) => ({ curPopup: state.header.curPopup })
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
    const [customOps, setCustomOps] = useState<OperatorFormat>({ ...FORMATS[0], icon: "custom" });

    const reset = () => {
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
                            spellCheck={false}
                            onChange={(e) => setExpression(e.target.value)} />
                <br />

                <div className="exprtocircuit__popup__settings">
                    <div>
                        <h3>Notation</h3>
                        {FORMATS.map((curFormat) =>
                            (<ButtonToggle key={curFormat.icon}
                                           isOn={format === curFormat.icon} height="40px"
                                           onChange={() => setFormat(curFormat.icon)}>{curFormat.label}</ButtonToggle>)
                        )}
                        <ButtonToggle isOn={format === "custom"} height="40px"
                                      onChange={() => setFormat("custom")}>Custom</ButtonToggle>
                        {
                            format === "custom" &&
                            <CustomOps customOps={customOps} setCustomOps={setCustomOps} />
                        }
                    </div>

                    <div>
                        <h3>Options</h3>
                        <BooleanOption option={label}
                                       setOption={setLabel}
                                       text="Place labels for inputs"
                                       displayCondition />
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

                <button type="button"
                        className="exprtocircuit__popup__generate"
                        disabled={expression===""}
                        onClick={() => {
                            const result = Generate(circuit, camera, expression, {
                                input, output, isIC,
                                connectClocksToOscope: clocksToOscope,
                                ops:                   customOps,
                                label, format,
                            });
                            if (!result.ok) {
                                setErrorMessage(result.error.errors.map((err) => err.message).join("\n"));
                                console.error(result.error);
                            } else {
                                reset();
                            }
                        }}>
                    Generate
                </button>

                <button type="button" className="cancel" onClick={reset}>Cancel</button>
            </div>
        </Popup>
    );
});
