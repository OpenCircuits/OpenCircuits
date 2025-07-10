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

import {CreateCircuit, DigitalCircuit} from "digital/api/circuit/public";

import {CreateDesigner, DigitalCircuitDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {ICResizeTool}   from "digital/api/circuitdesigner/tools/ICResizeTool";
import {ICPortTool}     from "digital/api/circuitdesigner/tools/ICPortTool";

import {IC_DESIGNER_VH, IC_DESIGNER_VW}         from "digital/site/utils/Constants";
import {useDigitalDispatch, useDigitalSelector} from "digital/site/utils/hooks/useDigital";
import {useCurDigitalDesigner}                  from "digital/site/utils/hooks/useDigitalDesigner";
import {CloseICDesigner}                        from "digital/site/state/ICDesigner";
import {CalculateICDisplay}                     from "digital/site/utils/CircuitUtils";

import "./index.scss";


const enum NameErrorStates {
    None,
    NoName,
    DuplicateName,
}
// TODO[master] - move this to shared
interface Props {
}
export const ICDesigner = ({ }: Props) => {
    const mainDesigner = useCurDigitalDesigner();
    const [icViewDesigner, setICViewDesigner] = useState<DigitalCircuitDesigner | undefined>();
    const [showError, setShowError] = useState(NameErrorStates.None);

    const { isActive, objIds } = useDigitalSelector(
        (state) => ({ ...state.icDesigner })
    );
    const dispatch = useDigitalDispatch();

    const { w, h } = useWindowSize();
    const canvas = useRef<HTMLCanvasElement>(null);

    const [icName, setICName] = useState<string | undefined>(undefined);

    const measureTextWidth = (text: string): number => {
        if (!canvas.current)
            return 0;
        const ctx = canvas.current.getContext("2d")!;
        ctx.save();
        ctx.font = "lighter 300px arial";
        const result = ctx.measureText(text);
        ctx.restore();
        return ((result.actualBoundingBoxLeft + result.actualBoundingBoxRight) / 1000);
    }

    // Happens when activated
    useLayoutEffect(() => {
        if (!isActive || !objIds || !canvas.current)
            return;

        // Block input for main designer
        mainDesigner.viewport.canvasInfo!.input.setBlocked(true);

        // Create main circuit
        const circuit = CreateCircuit();

        // Create the IC from the objIds in the main designer's circuit
        // and replace all input/output components with input/output pins.
        const icCircuit: DigitalCircuit = CreateCircuit();
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
            circuit,
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
        setShowError(NameErrorStates.None);
        const ic = icViewDesigner.circuit.getICs().at(-1)!;
        ic.name = name;
        ic.display.size = V(Math.max(ic.display.size.x, measureTextWidth(name) + 1), ic.display.size.y);
    }


    const close = (cancelled = false) => {
        // If not active, do nothing
        if (!isActive)
            return;

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

    useWindowKeyDownEvent("Escape", () => close(true), [isActive, objIds, mainDesigner]);
    useWindowKeyDownEvent("Enter", () => close(false), [isActive, objIds, mainDesigner]);

    return (
        <div className="icdesigner" style={{ display: (isActive ? "initial" : "none"), height: h+"px" }}>
            <canvas ref={canvas}
                    width={w*IC_DESIGNER_VW}
                    height={h*IC_DESIGNER_VH} />

            {icViewDesigner &&
                (<TextModuleInputField
                    circuit={icViewDesigner.circuit}
                    props={[icName ?? ""]}
                    placeholder="Name of IC"
                    alt="Name of IC"
                    doChange={doICNameChange} />)}
            {showError !== NameErrorStates.None &&
                // TODO[]: Create a more generic error tooltip component
                (<span className="tooltip">{
                    showError === NameErrorStates.NoName ?
                        "Please enter a name for this IC" :
                        "This name is already used by another IC"
                }</span>)}

            <div className="icdesigner__buttons">
                <button type="button" name="confirm" onClick={() => {
                    if (!icName) {
                        setShowError(NameErrorStates.NoName);
                    } else if (mainDesigner.circuit.getICs().some((ic) => ic.name === icName)) {
                        setShowError(NameErrorStates.DuplicateName);
                    } else {
                        setShowError(NameErrorStates.None);
                        close();
                    }
                }}>
                    Confirm
                </button>
                <button type="button" name="cancel"  onClick={() => {
                    setShowError(NameErrorStates.None);
                    close(true)
                }}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
