import {DefaultTool} from "shared/api/circuitdesigner/tools/DefaultTool";
import {PanTool}     from "shared/api/circuitdesigner/tools/PanTool";

import {FitToScreenHandler} from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";
import {RedoHandler}        from "shared/api/circuitdesigner/tools/handlers/RedoHandler";
import {UndoHandler}        from "shared/api/circuitdesigner/tools/handlers/UndoHandler";

// import {DigitalCircuitInfo} from "digital/api/circuit/utils/DigitalCircuitInfo";

import {useDigitalDispatch, useDigitalSelector} from "digital/site/utils/hooks/useDigital";

import {IC_DESIGNER_VW, IC_DESIGNER_VH} from "digital/site/utils/Constants";

// import {CreateInfo} from "digital/site/utils/CircuitInfo/CreateInfo";

import "./index.scss";
import {useDesigner, useMainDesigner} from "shared/site/utils/hooks/useDesigner";
import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {CreateDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {ICResizeTool} from "digital/api/circuitdesigner/tools/ICResizeTool";
import {ICPortTool} from "digital/api/circuitdesigner/tools/ICPortTool";
import {CreateCircuit, DigitalCircuit} from "digital/api/circuit/public";
import {V} from "Vector";
import {useKeyDownEvent, useWindowKeyDownEvent} from "shared/site/utils/hooks/useKeyDownEvent";
import {CloseICDesigner} from "digital/site/state/ICDesigner";
import {InputField} from "shared/site/components/InputField";
import {CalculateICDisplay} from "digital/site/utils/CircuitUtils";
import {DRAG_TIME} from "shared/api/circuitdesigner/input/Constants";
import {ZoomHandler} from "shared/api/circuitdesigner/tools/handlers/ZoomHandler";
import {TextModuleInputField} from "shared/site/containers/SelectionPopup/modules/inputs/TextModuleInputField";
import {Cleanups} from "shared/api/circuit/utils/types";

// const EdgesToCursors: Record<ICEdge, string> = {
//     "none":       "default",
//     "horizontal": "ew-resize",
//     "vertical":   "ns-resize",
// };


// export const ICDesigner = () => {return null}
type Props = {
    // mainInfo: DigitalCircuitInfo;
}
// @TODO
export const ICDesigner = ({ }: Props) => {
    const mainDesigner = useMainDesigner();
    const [icViewDesigner, setICViewDesigner] = useState<CircuitDesigner | undefined>();

    const { isActive, objIds } = useDigitalSelector(
        (state) => ({ ...state.icDesigner })
    );
    const dispatch = useDigitalDispatch();

    const { w, h } = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>(null);

    const [icName, setICName] = useState<string | undefined>(undefined);

    // Happens when activated
    useLayoutEffect(() => {
        if (!isActive || !objIds || !canvas.current)
            return;

        // Block input for main designer
        mainDesigner.viewport.canvasInfo!.input.setBlocked(true);

        // Create main circuit
        const [circuit, state] = CreateCircuit();

        // Create the IC from the objIds in the main designer's circuit
        const [icCircuit] = CreateCircuit();
        const objs = mainDesigner.circuit.createContainer(objIds).withWiresAndPorts();
        icCircuit.loadSchema(objs.toSchema());
        const ic = circuit.createIC({
            circuit: icCircuit,
            display: CalculateICDisplay(icCircuit),
        });
        const icInstance = circuit.placeComponentAt(ic.id, V(0, 0));

        // Clear the history so that the user can't accidentally undo the addition of the IC
        circuit.history.clear();

        // Create new designer and add IC
        const designer = CreateDesigner(
            {
                defaultTool: new DefaultTool(
                    FitToScreenHandler, RedoHandler, UndoHandler, ZoomHandler
                ),
                tools: [
                    new PanTool(), new ICResizeTool(ic.id, icInstance.id), new ICPortTool(ic.id, icInstance.id),
                ],
            },
            [],
            DRAG_TIME,
            [circuit, state],
        );

        // Synchronize current debug info from mainInfo
        designer.viewport.debugOptions = mainDesigner.viewport.debugOptions;

        // Attach canvas
        const cleanup = designer.viewport.attachCanvas(canvas.current);

        // Subscribe to circuit to look for name changes to update text (to handle undo/redo mostly)
        const cleanup2 = designer.circuit.subscribe(() =>
            setICName(designer.circuit.getICs()[0].name));

        setICViewDesigner(designer);

        return Cleanups(cleanup, cleanup2);
    }, [isActive, objIds, mainDesigner, setICViewDesigner, setICName]);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => {
        if (!icViewDesigner)
            return;
        icViewDesigner.viewport.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH);
    }, [icViewDesigner, w, h]);


    const doICNameChange = ([name]: string[]) => {
        if (!icViewDesigner)
            return;
        icViewDesigner.circuit.getICs()[0].name = name;
    }


    const close = (cancelled = false) => {
        if (!objIds)
            throw new Error("ICDesigner.close failed: objIds were undefined");

        // Block input while closed
        setICViewDesigner(undefined);

        if (!cancelled) {
            const circuit = mainDesigner.circuit;

            circuit.beginTransaction();

            const ic = icViewDesigner!.circuit.getICs()[0];
            circuit.importICs([ic]);

            // Create IC on center of screen
            const icInstance = circuit.placeComponentAt(ic.id, mainDesigner.viewport.camera.pos);

            circuit.selections.clear();
            icInstance.select();

            circuit.commitTransaction();
        }

        // Unblock main input
        mainDesigner.viewport.canvasInfo!.input.setBlocked(false);

        dispatch(CloseICDesigner());
    }

    useWindowKeyDownEvent("Escape", () => close(true), [objIds]);
    useWindowKeyDownEvent("Enter", () => close(false), [objIds]);

    return (
        <div className="icdesigner" style={{ display: (isActive ? "initial" : "none"), height: h+"px" }}>
            <canvas ref={canvas}
                    width={w*IC_DESIGNER_VW}
                    height={h*IC_DESIGNER_VH} />

            {icViewDesigner &&
                <TextModuleInputField
                    circuit={icViewDesigner.circuit}
                    props={[icName ?? ""]}
                    placeholder="Name of IC"
                    alt="Name of IC"
                    doChange={doICNameChange} />}

            <div className="icdesigner__buttons">
                <button type="button" name="confirm" onClick={() => close()}>
                    Confirm
                </button>
                <button type="button" name="cancel"  onClick={() => close(true)}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
