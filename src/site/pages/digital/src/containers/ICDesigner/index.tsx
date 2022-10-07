import {useEffect, useLayoutEffect, useRef, useState} from "react";

import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/digital/utils/Constants";

import {V} from "Vector";

import {Input} from "core/utils/Input";

import {GroupAction} from "core/actions/GroupAction";

import {Place}               from "core/actions/units/Place";
import {DeselectAll, Select} from "core/actions/units/Select";

import {DefaultTool} from "core/tools/DefaultTool";
import {PanTool}     from "core/tools/PanTool";

import {FitToScreenHandler} from "core/tools/handlers/FitToScreenHandler";
import {RedoHandler}        from "core/tools/handlers/RedoHandler";
import {UndoHandler}        from "core/tools/handlers/UndoHandler";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {ICCircuitInfo}      from "digital/utils/ICCircuitInfo";

import {AddICData} from "digital/actions/units/AddICData";

import {ICPortTool}   from "digital/tools/ICPortTool";
import {ICEdge,
        ICResizeTool} from "digital/tools/ICResizeTool";

import {IC} from "digital/models/ioobjects";

import {useKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";
import {useWindowSize}   from "shared/utils/hooks/useWindowSize";

import {InputField} from "shared/components/InputField";

import {GetRenderFunc} from "site/digital/utils/Rendering";

import {CreateInfo} from "site/digital/utils/CircuitInfo/CreateInfo";

import {useDigitalDispatch, useDigitalSelector} from "site/digital/utils/hooks/useDigital";

import {CloseICDesigner} from "site/digital/state/ICDesigner";

import "./index.scss";


type Props = {
    mainInfo: DigitalCircuitInfo;
}
export const ICDesigner = (() => {
    const info = CreateInfo(
        new DefaultTool(FitToScreenHandler, RedoHandler, UndoHandler),
        PanTool, ICPortTool, ICResizeTool
    );

    const icInfo: ICCircuitInfo = {
        ...info,
    };

    const EdgesToCursors: Record<ICEdge, string> = {
        "none":       "default",
        "horizontal": "ew-resize",
        "vertical":   "ns-resize",
    };

    // eslint-disable-next-line react/display-name
    return ({ mainInfo }: Props) => {
        const { isActive, ic: data } = useDigitalSelector(
            (state) => ({ ...state.icDesigner })
        );
        const dispatch = useDigitalDispatch();

        const { w, h } = useWindowSize();
        const canvas = useRef<HTMLCanvasElement>(null);
        const [{ name }, setName] = useState({ name: "" });
        const [{ cursor }, setCursor] = useState({ cursor: "default" });

        // On resize (useLayoutEffect happens sychronously so
        //  there's no pause/glitch when resizing the screen)
        useLayoutEffect(() => {
            if (!isActive)
                return;
            icInfo.camera.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH); // Update camera size when w/h changes
            icInfo.renderer.render(); // Re-render
        }, [isActive, w, h]);


        // Initial function called after the canvas first shows up
        useEffect(() => {
            if (!canvas.current)
                throw new Error("ICDesigner.useEffect failed: canvas.current is null");
            // Create input w/ canvas
            icInfo.input = new Input(canvas.current);

            // Get render function
            const renderFunc = GetRenderFunc({ canvas: canvas.current, info: icInfo });

            // Add input listener
            icInfo.input.addListener((event) => {
                const change = icInfo.toolManager.onEvent(event, icInfo);

                // Change cursor
                let newCursor = ICPortTool.findPort(icInfo) === undefined ? "none" : "move";
                if (newCursor === "none")
                    newCursor = EdgesToCursors[ICResizeTool.findEdge(icInfo)];
                setCursor({ cursor: newCursor });

                if (change)
                    icInfo.renderer.render();
            });

            // Input should be blocked initially
            icInfo.input.block();

            // Add render callbacks and set render function
            icInfo.designer.addCallback(() => icInfo.renderer.render());

            icInfo.renderer.setRenderFunction(() => renderFunc());
            icInfo.renderer.render();
        }, [setCursor]); // Pass empty array so that this only runs once on mount

        // Keeps the ICData/IC name's in sync with `name`
        useLayoutEffect(() => {
            if (!data || !icInfo.ic)
                return;
            data.setName(name ?? "");
            icInfo.ic.update();
            icInfo.renderer.render();
        }, [name, data]);

        // Happens when activated
        useLayoutEffect(() => {
            if (!isActive || !data)
                return;

            // Retrieve current debug info from mainInfo
            icInfo.debugOptions = mainInfo.debugOptions;

            // Unlock input
            icInfo.input.unblock();

            // Block input for main designer
            mainInfo.input.block();

            // Reset designer and add IC
            icInfo.designer.reset();
            icInfo.ic = new IC(data);
            icInfo.ic.setPos(V());
            icInfo.designer.addObject(icInfo.ic);

            // Set camera
            icInfo.camera.setPos(V());

            icInfo.renderer.render();
        }, [isActive, data, mainInfo, setName]);


        const close = (cancelled = false) => {
            // Block input while closed
            icInfo.input.block();

            if (!cancelled) {
                if (!data)
                    throw new Error("ICDesigner.close failed: data was undefined");

                // Create IC on center of screen
                const ic = new IC(data);
                ic.setPos(mainInfo.camera.getPos());

                // Deselect other things, create IC and select it
                const action = new GroupAction([
                    DeselectAll(mainInfo.selections),
                    AddICData(data, mainInfo.designer),
                    Place(mainInfo.designer, ic),
                    Select(mainInfo.selections, ic),
                ], "Create IC Action");
                mainInfo.history.add(action);
                mainInfo.renderer.render();
            }

            // Unblock main input
            mainInfo.input.unblock();

            icInfo.ic = undefined;
            dispatch(CloseICDesigner());
            setName({ name: "" }); // Clear name
        }

        useKeyDownEvent(icInfo.input, "Escape", () => close(true),  [data, mainInfo]);
        useKeyDownEvent(icInfo.input, "Enter",  () => close(false), [data, mainInfo]);

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
})();
