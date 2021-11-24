import {useEffect, useRef, useState} from "react";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CloseHeaderPopups} from "shared/state/Header";

import {Popup} from "shared/components/Popup";
import {SwitchToggle} from "shared/components/SwitchToggle";

import "./index.scss";
import {Clamp} from "math/MathUtils";
import {ButtonToggle} from "shared/components/ButtonToggle";
import {HEADER_HEIGHT} from "shared/utils/Constants";


const MIN_IMG_SIZE = 50;
const MAX_IMG_SIZE = 10000;


type ImageExportOptions = {
    type: "png" | "jpeg" | "pdf";
    width: number;
    height: number;
    bgColor: string;
    useGrid: boolean;
}

export type ImageExporterPreviewProps = {
    canvas: React.MutableRefObject<HTMLCanvasElement>;
    isActive: boolean;
    width: number;
    height: number;
    useGrid: boolean;
    style: React.CSSProperties;
}

type Props = {
    preview: (props: ImageExporterPreviewProps) => JSX.Element;
}
export const ImageExporterPopup = ({preview}: Props) => {
    const {curPopup} = useSharedSelector(
        state => ({ curPopup: state.header.curPopup })
    );
    const dispatch = useSharedDispatch();


    const [state, setState] = useState<ImageExportOptions>({
        type: "png",
        width: window.innerWidth, height: window.innerHeight-HEADER_HEIGHT,
        bgColor: "#cccccc", useGrid: true,
    });

    const wrapper = useRef<HTMLDivElement>();
    const canvas = useRef<HTMLCanvasElement>();

    const onResize = () => {
        // Fit the canvas within the wrapper using the same ratio as the actual canvas
        const sw = Clamp(state.width, MIN_IMG_SIZE, MAX_IMG_SIZE);
        const sh = Clamp(state.height, MIN_IMG_SIZE, MAX_IMG_SIZE);

        const ratio = sw / sh;
        const wrapperRatio = wrapper.current.clientWidth / wrapper.current.clientHeight;

        const w = (ratio > wrapperRatio) ? (wrapper.current.clientWidth) : (wrapper.current.clientHeight * ratio);
        const h = w / ratio;

        canvas.current.style.width  = `${w}px`;
        canvas.current.style.height = `${h}px`;
    }

    useEffect(() => {
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [wrapper, canvas, state.width, state.height]);

    useEffect(() => {
        if (curPopup === "image_exporter")
            onResize();
    }, [curPopup, state.width, state.height]);

    return (
        <Popup title="Image Exporter"
               isOpen={(curPopup === "image_exporter")}
               close={() => dispatch(CloseHeaderPopups())}>
            <div className="imageexporter__popup">
                <div className="imageexporter__popup__canvas-wrapper" ref={wrapper}>
                    {preview({
                        canvas,
                        isActive: (curPopup === "image_exporter"),
                        width: Clamp(state.width , MIN_IMG_SIZE, MAX_IMG_SIZE),
                        height: Clamp(state.height, MIN_IMG_SIZE, MAX_IMG_SIZE),
                        useGrid: state.useGrid,
                        style: {
                            backgroundColor: state.bgColor,
                        }
                    })}
                </div>
                <div className="imageexporter__popup__options">
                    <h2>Options</h2>
                    <div>
                        <div>
                            <span>Grid</span>
                            <div className="imageexporter__popup__options__switch">
                                <SwitchToggle
                                    isOn={state.useGrid}
                                    onChange={() => setState({...state, useGrid: !state.useGrid})}
                                    hideStateText
                                    text={""} />
                            </div>
                        </div>
                        <div>
                            <span>Background color</span>
                            <div>
                                <input
                                    type="color"
                                    value={state.bgColor}
                                    onChange={(ev) => setState({...state, bgColor: ev.target.value})} />
                            </div>
                        </div>
                        <div>
                            <span>Size</span>
                            <div>
                                <input
                                    type="number"
                                    value={state.width}
                                    step={50} min={MIN_IMG_SIZE} max={MAX_IMG_SIZE}
                                    onChange={(ev) => setState({...state, width: ev.target.valueAsNumber})} />
                                <input
                                    type="number"
                                    value={state.height}
                                    step={50} min={MIN_IMG_SIZE} max={MAX_IMG_SIZE}
                                    onChange={(ev) => setState({...state, height: ev.target.valueAsNumber})} />
                            </div>
                        </div>
                        <div>
                            <span>File Type</span>
                            <div className="imageexporter__popup__options__buttons">
                                <div>
                                    <ButtonToggle isOn={state.type === "png"} height="50px"
                                                  onChange={() => setState({...state, type: "png"})} />
                                    <span>PNG</span>
                                </div>
                                <div>
                                    <ButtonToggle isOn={state.type === "jpeg"} height="50px"
                                                  onChange={() => setState({...state, type: "jpeg"})} />
                                    <span>JPEG</span>
                                </div>
                                <div>
                                    <ButtonToggle isOn={state.type === "pdf"} height="50px"
                                                  onChange={() => setState({...state, type: "pdf"})} />
                                    <span>PDF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button name="confirm">Export as {state.type.toUpperCase()}</button>
                        <button name="cancel">Cancel</button>
                    </div>
                </div>
            </div>
        </Popup>
    );
}
