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
    const [{ name }, setName] = useState({ name: "" });
    const [{ cursor }, setCursor] = useState({ cursor: "default" });


    // // Initial function called after the canvas first shows up
    // useLayoutEffect(() => {
    //     if (!canvas.current)
    //         return;
    //     const cleanup = icViewDesigner?.viewport.attachCanvas(canvas.current);

    //     // // Create input w/ canvas
    //     // icInfo.input = new Input(canvas.current);

    //     // // Get render function
    //     // const renderFunc = GetRenderFunc({ canvas: canvas.current, info: icInfo });

    //     // // Add input listener
    //     // icInfo.input.addListener((event) => {
    //     //     const change = icInfo.toolManager.onEvent(event, icInfo);

    //     //     // Change cursor
    //     //     let newCursor = ICPortTool.findPort(icInfo) === undefined ? "none" : "move";
    //     //     if (newCursor === "none")
    //     //         newCursor = EdgesToCursors[ICResizeTool.findEdge(icInfo)];
    //     //     setCursor({ cursor: newCursor });

    //     //     if (change)
    //     //         icInfo.renderer.render();
    //     // });

    //     // // Input should be blocked initially
    //     // icInfo.input.block();

    //     // // Add render callbacks and set render function
    //     // icInfo.designer.addCallback(() => icInfo.renderer.render());

    //     // icInfo.renderer.setRenderFunction(() => renderFunc());
    //     // icInfo.renderer.render();
    //     icViewDesigner.viewport.setBlocked(true);

    //     return cleanup;
    // }, [icViewDesigner, canvas, setCursor]);

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

        setICViewDesigner(designer);

        return cleanup;
    }, [isActive, objIds, mainDesigner, setICViewDesigner, setName]);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => {
        if (!icViewDesigner)
            return;
        icViewDesigner?.viewport.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH);
    }, [icViewDesigner, w, h]);

    // Keeps the ICData/IC name's in sync with `name`
    useLayoutEffect(() => {
        if (!isActive || !icViewDesigner)
            return;
        // Should only ever be the 1 component
        icViewDesigner.circuit.getComponents()[0].name = name ?? "";
    }, [name, icViewDesigner]);


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
        setName({ name: "" }); // Clear name
    }

    useWindowKeyDownEvent("Escape", () => close(true), [objIds]);
    useWindowKeyDownEvent("Enter", () => close(false), [objIds]);

    return (
        <div className="icdesigner" style={{ display: (isActive ? "initial" : "none"), height: h+"px" }}>
            <canvas ref={canvas}
                    width={w*IC_DESIGNER_VW}
                    height={h*IC_DESIGNER_VH}
                    style={{ cursor }} />

            <InputField type="text"
                        value={name}
                        placeholder="IC Name"
                        onChange={(ev) => setName({ name: ev.target.value })} />

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
