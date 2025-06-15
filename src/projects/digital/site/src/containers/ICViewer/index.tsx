import {DefaultTool} from "shared/api/circuitdesigner/tools/DefaultTool";
import {PanTool}     from "shared/api/circuitdesigner/tools/PanTool";

// import {DigitalCircuitInfo} from "digital/api/circuit/utils/DigitalCircuitInfo";

// import {CreateInfo} from "digital/site/utils/CircuitInfo/CreateInfo";

import "./index.scss";
import {useDigitalDispatch, useDigitalSelector} from "digital/site/utils/hooks/useDigital";
import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";
import {useLayoutEffect, useRef, useState} from "react";
import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "digital/site/utils/Constants";
import {useCurDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";
import {CreateDesigner, DigitalCircuitDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {CreateCircuit} from "digital/api/circuit/public";
import {FitToScreenHandler} from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";
import {ZoomHandler} from "shared/api/circuitdesigner/tools/handlers/ZoomHandler";
import {InteractionHandler} from "digital/api/circuitdesigner/tools/handlers/InteractionHandler";
import {DRAG_TIME} from "shared/api/circuitdesigner/input/Constants";
import {Cleanups} from "shared/api/circuit/utils/types";
import {CloseICViewer} from "digital/site/state/ICViewer";
import {useWindowKeyDownEvent} from "shared/site/utils/hooks/useKeyDownEvent";
import {TimedDigitalSimRunner} from "digital/api/circuit/internal/sim/TimedDigitalSimRunner";


const IC_VIEWER_ZOOM_PADDING_RATIO = 1.5;

// function CheckForInteraction(ev: InputAdapterEvent, { toolManager, camera, designer, input, currentlyPressedObject }: CircuitInfo) {
//     if (toolManager.getCurrentTool() instanceof InteractionTool) {
//         const worldMousePos = camera.getWorldPos(input.getMousePos());
//         const obj = designer.getObjects().reverse()
//             .find((p) => isPressable(p) && p.isWithinPressBounds(worldMousePos));

//         // Check if Switch was clicked
//         if (obj instanceof Switch && ev.type === "click")
//             return true;

//         // Or if Button was pressed/released
//         if (currentlyPressedObject === obj && obj instanceof Button
//                  && (ev.type === "mousedown" || ev.type === "mouseup"))
//             return true;
//     }
//     return false;
// }

export const ICViewer = () => {
    const mainDesigner = useCurDigitalDesigner();
    const [icViewDesigner, setICViewDesigner] = useState<DigitalCircuitDesigner | undefined>();

    const { isActive, icId } = useDigitalSelector(
        (state) => ({ ...state.icViewer })
    );
    const dispatch = useDigitalDispatch();

    const { w, h } = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>(null);

    // TODO[model_refactor_api]
    // State controller for main designer callback
    const [pauseUpdates, setPauseUpdates] = useState(false);
    //
    // const updateViewer = useCallback(() => {
    //     if (!ic)
    //         return;
    //     // loop through all the inputs for this IC
    //     //  set their input value to be what the info.designer has for their input
    //     const viewerInputs = info.designer.getObjects().filter(
    //         (input) => [Switch, Button].some((type) => input instanceof type)
    //     );
    //     for (let i = 0; i < viewerInputs.length; ++i)
    //         viewerInputs[i].activate(ic.getInputPort(i).getIsOn());
    // }, [ic]);

    // // Initial function called after the canvas first shows up
    // useEffect(() => {
    //     if (!canvas.current)
    //         throw new Error("ICViewer.useEffect failed: canvas.current is null");

    //     // Create input w/ canvas
    //     info.input = new Input(canvas.current);

    //     // Get render function
    //     const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

    //     // Add input listener
    //     info.input.addListener((event) => {
    //         const change = info.toolManager.onEvent(event, info);
    //         if (!change)
    //             return;

    //         info.renderer.render();
    //         if (CheckForInteraction(event, info))
    //             setPauseUpdates(true);
    //     });

    //     // Input should be blocked initially
    //     info.input.block();

    //     // Add render callbacks and set render function
    //     info.designer.addCallback(() => info.renderer.render());

    //     info.renderer.setRenderFunction(() => renderFunc());
    //     info.renderer.render();
    // }, []); // Pass empty array so that this only runs once on mount

    // Happens when activated
    useLayoutEffect(() => {
        if (!isActive || !icId || !canvas.current)
            return;

        // Block input for main designer
        mainDesigner.viewport.canvasInfo!.input.setBlocked(true);

        // Get the IC and load its contents into circuit
        const icInstance = mainDesigner.circuit.getComponent(icId);
        if (!icInstance)
            throw new Error(`ICViewer: Failed to find ic instance with id ${icId}!`);
        const ic = mainDesigner.circuit.getIC(icInstance.kind);
        if (!ic)
            throw new Error(`ICViewer: Failed to find ic with id ${icInstance.kind}!`);

        // Create main circuit
        const [circuit, state] = CreateCircuit();
        circuit.import(ic.all);
        for (const comp of circuit.getComponents()) {
            if (comp.kind === "InputPin")
                comp.replaceWith("Switch");
            if (comp.kind === "OutputPin")
                comp.replaceWith("LED");
        }
        // TODO[model_refactor_api]
        // Adjust the camera so it all fits in the viewer
        // const [pos, zoom] = GetCameraFit(
        //     info.camera, inside.toList() as CullableObject[], IC_VIEWER_ZOOM_PADDING_RATIO
        // );

        // Clear the history so that the user can't accidentally undo the addition of the IC
        circuit.history.clear();

        // Create new designer
        const designer = CreateDesigner(
            {
                defaultTool: new DefaultTool(InteractionHandler, FitToScreenHandler, ZoomHandler),
                tools:       [new PanTool()],
            },
            [],
            DRAG_TIME,
            [circuit, state],
        );

        // Setup propagator
        state.simRunner = new TimedDigitalSimRunner(state.sim, 1);

        // Synchronize current debug info from mainInfo
        designer.viewport.debugOptions = mainDesigner.viewport.debugOptions;

        // Attach canvas
        const cleanup = designer.viewport.attachCanvas(canvas.current);

        setICViewDesigner(designer);

        return Cleanups(cleanup);
    }, [isActive, icId, mainDesigner, setICViewDesigner]);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => {
        if (!icViewDesigner)
            return;
        icViewDesigner.viewport.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH);
    }, [isActive, w, h]);

    // TODO[model_refactor_api]
    // // Synchronize the inputs in the original designer and this IC viewer
    // //  (issue #754)
    // useEffect(() => {
    //     if (pauseUpdates)
    //         return; // if paused, don't add callback
    //     mainInfo.designer.addCallback(updateViewer);
    //     // remove callback when done
    //     return () => mainInfo.designer.removeCallback(updateViewer);
    // }, [pauseUpdates, mainInfo, updateViewer]);

    const close = () => {
        // // Reset in case for next time
        // setPauseUpdates(false);
        setICViewDesigner(undefined);

        // Unblock main input
        mainDesigner.viewport.canvasInfo!.input.setBlocked(false);

        dispatch(CloseICViewer());
    }

    const sync = () => {
        setPauseUpdates(false);
        // updateViewer();
    }

    useWindowKeyDownEvent("Escape", () => close(), [mainDesigner]);

    return (
        <div className="icviewer" style={{ display: (isActive ? "initial" : "none"), height: h+"px" }}>
            <canvas ref={canvas}
                    width={w*IC_DESIGNER_VW}
                    height={h*IC_DESIGNER_VH} />

            <div className="icviewer__buttons">
                <button type="button" name="close" onClick={close}>
                    Close
                </button>
                <button type="button" name="restore" disabled={!pauseUpdates} onClick={sync}>
                    Sync
                </button>
            </div>
        </div>
    );
}
