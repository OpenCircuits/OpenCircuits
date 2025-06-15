import {useLayoutEffect, useRef, useState} from "react";

import {V} from "Vector";

import {Cleanups} from "shared/api/circuit/utils/types";

import {DRAG_TIME}          from "shared/api/circuitdesigner/input/Constants";
import {DefaultTool}        from "shared/api/circuitdesigner/tools/DefaultTool";
import {PanTool}            from "shared/api/circuitdesigner/tools/PanTool";
import {FitToScreenHandler} from "shared/api/circuitdesigner/tools/handlers/FitToScreenHandler";
import {RedoHandler}        from "shared/api/circuitdesigner/tools/handlers/RedoHandler";
import {UndoHandler}        from "shared/api/circuitdesigner/tools/handlers/UndoHandler";
import {ZoomHandler}        from "shared/api/circuitdesigner/tools/handlers/ZoomHandler";

import {useWindowSize}         from "shared/site/utils/hooks/useWindowSize";
import {useWindowKeyDownEvent} from "shared/site/utils/hooks/useKeyDownEvent";
import {TextModuleInputField}  from "shared/site/containers/SelectionPopup/modules/inputs/TextModuleInputField";

import {CreateCircuit} from "digital/api/circuit/public";

import {CreateDesigner, DigitalCircuitDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {ICResizeTool}   from "digital/api/circuitdesigner/tools/ICResizeTool";
import {ICPortTool}     from "digital/api/circuitdesigner/tools/ICPortTool";

import {IC_DESIGNER_VH, IC_DESIGNER_VW}         from "digital/site/utils/Constants";
import {useDigitalDispatch, useDigitalSelector} from "digital/site/utils/hooks/useDigital";
import {useCurDigitalDesigner}                  from "digital/site/utils/hooks/useDigitalDesigner";
import {CloseICDesigner}                        from "digital/site/state/ICDesigner";
import {CalculateICDisplay}                     from "digital/site/utils/CircuitUtils";

import "./index.scss";


// TODO[master] - move this to shared
interface Props {
}
export const ICDesigner = ({ }: Props) => {
    const mainDesigner = useCurDigitalDesigner();
    const [icViewDesigner, setICViewDesigner] = useState<DigitalCircuitDesigner | undefined>();

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
        // and replace all input/output components with input/output pins.
        const [icCircuit] = CreateCircuit();
        icCircuit.importICs(mainDesigner.circuit.getICs());
        icCircuit.import(mainDesigner.circuit.createContainer(objIds).withWiresAndPorts());

        for (const comp of icCircuit.getComponents()) {
            if (comp.kind === "Switch" || comp.kind === "Button" || comp.kind === "Clock")
                comp.replaceWith("InputPin");
            if (comp.kind === "LED")
                comp.replaceWith("OutputPin");
            comp.deselect();
        }

        circuit.importICs(mainDesigner.circuit.getICs());
        const ic = circuit.createIC({
            circuit: icCircuit,
            display: CalculateICDisplay(icCircuit),
        });
        const icInstance = circuit.placeComponentAt(ic.id, V(0, 0));

        // Clear the history so that the user can't accidentally undo the addition of the IC
        circuit.history.clear();

        // Create new designer
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
        icViewDesigner.circuit.getICs().at(-1)!.name = name;
        // TODO: Increase IC size if name gets too long for current size
    }


    const close = (cancelled = false) => {
        if (!objIds)
            throw new Error("ICDesigner.close failed: objIds were undefined");

        // Block input while closed
        setICViewDesigner(undefined);

        if (!cancelled) {
            const circuit = mainDesigner.circuit;

            circuit.beginTransaction();

            const ic = icViewDesigner!.circuit.getICs().at(-1)!;
            circuit.importICs([ic]);

            // Create IC on center of screen
            const icInstance = circuit.placeComponentAt(ic.id, mainDesigner.viewport.camera.pos);

            circuit.selections.clear();
            icInstance.select();

            circuit.commitTransaction("Created IC");
        }

        // Unblock main input
        mainDesigner.viewport.canvasInfo!.input.setBlocked(false);

        // Reset IC name input in designer back to empty
        setICName(undefined);

        dispatch(CloseICDesigner());
    }

    useWindowKeyDownEvent("Escape", () => close(true), [objIds, mainDesigner]);
    useWindowKeyDownEvent("Enter", () => close(false), [objIds, mainDesigner]);

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
