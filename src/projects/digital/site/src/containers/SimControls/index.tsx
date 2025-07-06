import {useEffect, useState} from "react";

import {DigitalCircuit} from "digital/api/circuit/public";

import pause  from "./pause.svg";
import resume from "./resume.svg";
import step   from "./step.svg";
import wrench from "./wrench.svg";

import "./index.scss";
import {InputField, NumberInputField} from "shared/site/components/InputField";
import {Clamp} from "math/MathUtils";


const MIN_SPEED = 0.1, MAX_SPEED = 1000;

export const SimControls = ({ circuit }: { circuit: DigitalCircuit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(circuit.sim.isPaused);
    const [curSpeed, setCurSpeed] = useState(1000 / circuit.sim.propagationTime);

    useEffect(() =>
        circuit.sim.subscribe((ev) => {
            if (ev.type === "pause")
                setIsPaused(true);
            if (ev.type === "resume")
                setIsPaused(false);
            if (ev.type === "propagationTimeChanged")
                setCurSpeed(1000 / ev.newTime);
        }), [circuit, setIsPaused, setCurSpeed]);

    const updateSpeed = (newSpeed: number) => {
        circuit.sim.propagationTime = 1000 / Clamp(newSpeed, 0.1, 1000);
    }
    // Slider is in log-space so that it's easier to control lower values.
    const updateSliderSpeed = (val: number) => {
        updateSpeed(Math.exp(Math.log(MIN_SPEED) + (Math.log(MAX_SPEED) - Math.log(MIN_SPEED)) * val));
    }

    const speed = (curSpeed > 10 ? Math.round(curSpeed) : curSpeed.toFixed(1));
    const sliderVal = (Math.log(curSpeed) - Math.log(MIN_SPEED)) / (Math.log(MAX_SPEED) - Math.log(MIN_SPEED));

    return (
        <div className="simcontrols">
            <div className={`simcontrols__area ${isOpen ? "open" : "closed"}`}>
                {isPaused ? (
                    <button type="button" title="Resume Simulation" onClick={() => circuit.sim.resume()}>
                        <img src={resume} width="30px" height="30px" alt="Resume" />
                    </button>
                ) : (
                    <button type="button" title="Pause Simulation" onClick={() => circuit.sim.pause()}>
                        <img src={pause} width="30px" height="30px" alt="Pause" />
                    </button>
                )}
                <button type="button" title="Step Simulation" disabled={!isPaused} onClick={() => circuit.sim.step()}>
                    <img src={step} width="30px" height="30px" alt="Step" />
                </button>
                <div className="simcontrols__area-separator"></div>
                <div className="simcontrols__area__slider">
                    <span>SPEED</span>
                    <InputField type="range" min={0} max={1} step={0.01} value={sliderVal} onChange={(ev) => updateSliderSpeed(ev.target.valueAsNumber)} />
                    <NumberInputField value={speed} min={MIN_SPEED} max={MAX_SPEED} onChange={(ev) => updateSpeed(ev.target.valueAsNumber)} />
                </div>
            </div>
            <button className="simcontrols__button" type="button" title="Step Simulation" onClick={() => setIsOpen(!isOpen)}>
                <img src={wrench} width="30px" height="30px" alt="Step" />
            </button>
        </div>
    );
}
