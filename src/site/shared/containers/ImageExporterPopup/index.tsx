import {useCallback, useEffect, useRef, useState} from "react";

import {HEADER_HEIGHT} from "shared/utils/Constants";

import {Clamp} from "math/MathUtils";

import {ImageExportOptions, SaveImage} from "shared/utils/ImageExporter";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {CloseHeaderPopups} from "shared/state/Header";

import {ButtonToggle} from "shared/components/ButtonToggle";
import {InputField}   from "shared/components/InputField";
import {Popup}        from "shared/components/Popup";
import {SwitchToggle} from "shared/components/SwitchToggle";

import "./index.scss";


const MIN_IMG_SIZE = 50;
const MAX_IMG_SIZE = 10_000;

export type ImageExporterPreviewProps = {
    canvas: React.RefObject<HTMLCanvasElement>;
    isActive: boolean;
    width: number;
    height: number;
    useGrid: boolean;
    style: React.CSSProperties;
}

type Props = {
    preview: (props: ImageExporterPreviewProps) => JSX.Element;
}
export const ImageExporterPopup = ({ preview }: Props) => {
    const { curPopup, circuitName } = useSharedSelector(
        (state) => ({ curPopup: state.header.curPopup, circuitName: state.circuit.name })
    );
    const dispatch = useSharedDispatch();

    const isActive = (curPopup === "image_exporter");

    const [state, setState] = useState<ImageExportOptions>({
        type:   "png",
        width:  window.innerWidth,
        height: window.innerHeight-HEADER_HEIGHT,

        bgColor: "#cccccc", useBg: true, useGrid: true,
    });

    const wrapper = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);

    const onResize = useCallback(() => {
        if (!isActive)
            return;
        if (!wrapper.current)
            throw new Error("ImageExporterPopup.onResize failed: wrapper.current is null");
        if (!canvas.current)
            throw new Error("ImageExporterPopup.onResize failed: canvas.current is null");

        // Fit the canvas within the wrapper using the same ratio as the actual canvas
        const sw = Clamp(state.width, MIN_IMG_SIZE, MAX_IMG_SIZE);
        const sh = Clamp(state.height, MIN_IMG_SIZE, MAX_IMG_SIZE);

        const ratio = sw / sh;
        const wrapperRatio = wrapper.current.clientWidth / wrapper.current.clientHeight;

        const w = (ratio > wrapperRatio) ? (wrapper.current.clientWidth) : (wrapper.current.clientHeight * ratio);
        const h = w / ratio;

        canvas.current.style.width  = `${w}px`;
        canvas.current.style.height = `${h}px`;
    }, [isActive, state.width, state.height]);

    useEffect(() => {
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [onResize]);

    return (
        <Popup title="Image Exporter"
               isOpen={(curPopup === "image_exporter")}
               close={() => dispatch(CloseHeaderPopups())}>
            <div className="imageexporter__popup">
                <div ref={wrapper}
                     className={`imageexporter__popup__canvas-wrapper ${state.useBg ? "" : "checkered"}`}>
                    {preview({
                        canvas,
                        isActive,
                        width:   Clamp(state.width , MIN_IMG_SIZE, MAX_IMG_SIZE),
                        height:  Clamp(state.height, MIN_IMG_SIZE, MAX_IMG_SIZE),
                        useGrid: state.useGrid,
                        style:   {
                            border:          "1px solid black",
                            backgroundColor: state.useBg ? state.bgColor : "transparent",
                        },
                    })}
                </div>
                <div className="imageexporter__popup__options">
                    <h2>Options</h2>
                    <div>
                        <div className="imageexporter__popup__options__switches">
                            <div>
                                <span>Grid</span>
                                <SwitchToggle
                                    isOn={state.useGrid} height="60px"
                                    onChange={() => setState({ ...state, useGrid: !state.useGrid })} />
                            </div>
                            <div>
                                <span>Background</span>
                                <SwitchToggle
                                    isOn={state.useBg} height="60px"
                                    onChange={() => setState({ ...state, useBg: !state.useBg })} />
                            </div>
                        </div>
                        <div>
                            <span>Background Color</span>
                            <div>
                                <InputField
                                    type="color"
                                    value={state.bgColor}
                                    onChange={(ev) => setState({ ...state, bgColor: ev.target.value })} />
                                <span>
                                    <button type="button"
                                            onClick={() => setState({ ...state, bgColor: "#cccccc" })}>Reset</button>
                                </span>
                            </div>
                        </div>
                        <div>
                            <span>Size</span>
                            <div>
                                <InputField
                                    type="number"
                                    value={state.width}
                                    step={50} min={MIN_IMG_SIZE} max={MAX_IMG_SIZE}
                                    onChange={(ev) => setState({ ...state, width: ev.target.valueAsNumber })} />
                                <InputField
                                    type="number"
                                    value={state.height}
                                    step={50} min={MIN_IMG_SIZE} max={MAX_IMG_SIZE}
                                    onChange={(ev) => setState({ ...state, height: ev.target.valueAsNumber })} />
                            </div>
                        </div>
                        <div>
                            <span>File Type</span>
                            <div className="imageexporter__popup__options__buttons">
                                <div>
                                    <ButtonToggle isOn={state.type === "png"} height="50px"
                                                  onChange={() => setState({ ...state, type: "png" })} />
                                    <span>PNG</span>
                                </div>
                                <div>
                                    <ButtonToggle isOn={state.type === "jpeg"} height="50px"
                                                  onChange={() => setState({ ...state, type: "jpeg" })} />
                                    <span>JPEG</span>
                                </div>
                                <div>
                                    <ButtonToggle isOn={state.type === "pdf"} height="50px"
                                                  onChange={() => setState({ ...state, type: "pdf" })} />
                                    <span>PDF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button type="button" name="confirm" onClick={() => {
                            if (!canvas.current)
                                throw new Error("ImageExporterPopup.button.onClick failed: canvas.current is null");
                            SaveImage(canvas.current, circuitName, state);
                        }}>
                            Export as {state.type.toUpperCase()}
                        </button>
                        <button type="button" name="cancel" onClick={() => dispatch(CloseHeaderPopups())}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </Popup>
    );
}
