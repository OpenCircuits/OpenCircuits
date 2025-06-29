import {DefaultTool} from "shared/api/circuitdesigner/tools/DefaultTool";
import {PanTool}     from "shared/api/circuitdesigner/tools/PanTool";

import "./index.scss";
import {useDigitalDispatch, useDigitalSelector} from "digital/site/utils/hooks/useDigital";
import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
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
import {GUID} from "shared/api/circuit/schema";


const IC_VIEWER_ZOOM_PADDING_RATIO = 1.5;

export const ICViewer = () => {
    const mainDesigner = useCurDigitalDesigner();
    const [icViewDesigner, setICViewDesigner] = useState<DigitalCircuitDesigner | undefined>();

    const [icInputCompIds, setICInputCompIds] = useState<GUID[]>([]);

    const { isActive, icId } = useDigitalSelector(
        (state) => ({ ...state.icViewer })
    );
    const dispatch = useDigitalDispatch();

    const { w, h } = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>(null);

    // State controller for main designer callback
    const [pauseUpdates, setPauseUpdates] = useState(false);

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
        const inputIDs: GUID[] = [];
        for (const comp of circuit.getComponents()) {
            if (comp.kind === "InputPin") {
                comp.replaceWith("Switch");
                inputIDs.push(comp.id);
            }
            if (comp.kind === "OutputPin")
                comp.replaceWith("LED");
        }
        setICInputCompIds(inputIDs);

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

        // Adjust the camera so it all fits in the viewer
        designer.viewport.zoomToFit(circuit.getObjs().all, IC_VIEWER_ZOOM_PADDING_RATIO);

        // When user interacts with a Switch, pause the syncing (issue #754)
        const cleanup2 = designer.subscribe((ev) => {
            if (ev.type === "handlerFired" && ev.handler === "InteractionHandler")
                setPauseUpdates(true);
        });

        setICViewDesigner(designer);

        return Cleanups(cleanup, cleanup2);
    }, [isActive, icId, mainDesigner, setICViewDesigner, setICInputCompIds]);

    // On resize (useLayoutEffect happens sychronously so
    //  there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => {
        if (!icViewDesigner)
            return;
        icViewDesigner.viewport.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH);
    }, [isActive, w, h]);

    // Synchronize the inputs in the original designer and this IC viewer (issue #754)
    useEffect(() => {
        if (!icViewDesigner || !icId || pauseUpdates)
            return;

        return mainDesigner.circuit.sim.subscribe(() => {
            const icInstance = mainDesigner.circuit.getComponent(icId)!;
            const ic = mainDesigner.circuit.getIC(icInstance.kind)!;

            icInputCompIds.forEach((compId) => {
                const comp = icViewDesigner.circuit.getComponent(compId)!;
                const port = comp.allPorts[0];
                const pin = ic.display.pins.find((p) => (p.id === port.id))!;
                // TODO[master] - This is not the only place where doing getting the index like this
                // is necessary, and it's awful. Pins should probably store their indices, especially
                // since we don't need to serialize them.
                const pinIndex = ic.display.pins
                    .filter((p) => (p.group === pin.group))
                    .findIndex((p) => (p.id === port.id));
                comp.setSimState([icInstance.ports[pin.group][pinIndex].signal]);
            });
        });
    }, [pauseUpdates, mainDesigner, icId, icViewDesigner]);

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
