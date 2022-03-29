import {useEffect, useLayoutEffect, useRef, useState} from "react";

import {IC_VIEWER_ZOOM_PADDING_RATIO} from "core/utils/Constants";
import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/digital/utils/Constants";

import {Input}        from "core/utils/Input";
import {GetCameraFit} from "core/utils/ComponentUtils";

import {CullableObject} from "core/models";

import {MoveCameraAction} from "core/actions/camera/MoveCameraAction";
import {InteractionTool}  from "core/tools/InteractionTool";
import {PanTool}          from "core/tools/PanTool";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";
import {useKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";

import {useDigitalDispatch, useDigitalSelector} from "site/digital/utils/hooks/useDigital";
import {CreateInfo}    from "site/digital/utils/CircuitInfo/CreateInfo";
import {GetRenderFunc} from "site/digital/utils/Rendering";

import {CloseICEditor} from "site/digital/state/ICEditor";

import "./index.scss";
import { PlaceAction } from "core/actions/addition/PlaceAction";
import { GroupAction } from "core/actions/GroupAction";
import { CreateDeselectAllAction, SelectAction } from "core/actions/selection/SelectAction";
import { CreateICDataAction } from "digital/actions/CreateICDataAction";
import { IC, ICData } from "digital/models/ioobjects";
import { CloseICDesigner } from "site/digital/state/ICDesigner";
import { DefaultTool } from "core/tools/DefaultTool";
import { FitToScreenHandler } from "core/tools/handlers/FitToScreenHandler";
import { RedoHandler } from "core/tools/handlers/RedoHandler";
import { UndoHandler } from "core/tools/handlers/UndoHandler";
import { ICPortTool } from "digital/tools/ICPortTool";
import { ICResizeTool } from "digital/tools/ICResizeTool";
import { ICCircuitInfo } from "digital/utils/ICCircuitInfo";


type Props = {
    mainInfo: DigitalCircuitInfo;
}
export const ICEditor = (() => {
    const info = CreateInfo(
        new DefaultTool(FitToScreenHandler, RedoHandler, UndoHandler),
        PanTool, ICPortTool, ICResizeTool
    );

    const icInfo: ICCircuitInfo = {
        ...info,
    };

    return ({ mainInfo }: Props) => {
        const {camera, designer, toolManager, renderer} = info;

        const {isActive, ic: data} = useDigitalSelector(
            state => ({ ...state.icEditor })
        );
        const dispatch = useDigitalDispatch();

        const {w, h} = useWindowSize();
        const canvas = useRef<HTMLCanvasElement>(null);
    //     const [{name}, setName] = useState({ name: "" });

        // On resize (useLayoutEffect happens sychronously so
        //  there's no pause/glitch when resizing the screen)
        useLayoutEffect(() => {
            if (!isActive)
                return;
            camera.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH); // Update camera size when w/h changes
            renderer.render(); // Re-render
        }, [isActive, w, h]);


        // Initial function called after the canvas first shows up
        useEffect(() => {
            if (!canvas.current)
                throw new Error("ICEditor.useEffect failed: canvas.current is null");
            // Create input w/ canvas
            info.input = new Input(canvas.current);

            // Get render function
            const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

            // Add input listener
            info.input.addListener((event) => {
                const change = toolManager.onEvent(event, info);
                if (change) renderer.render();
            });

            // Input should be blocked initially
            info.input.block();

            // Add render callbacks and set render function
            designer.addCallback(() => renderer.render());

            renderer.setRenderFunction(() => renderFunc());
            renderer.render();
        }, []); // Pass empty array so that this only runs once on mount

        // Happens when activated
        useLayoutEffect(() => {
            if (!isActive || !data)
                return;

            // Retrieve current debug info from mainInfo
            info.debugOptions = mainInfo.debugOptions;

            // Unlock input
            info.input.unblock();

            // Block input for main designer
            mainInfo.input.block();


            // Reset designer and add IC insides
            designer.reset();
            const inside = data.copy();
            designer.addGroup(inside);

            // Adjust the camera so it all fits in the viewer
            const [pos, zoom] = GetCameraFit(camera, inside.toList() as CullableObject[], IC_VIEWER_ZOOM_PADDING_RATIO);
            new MoveCameraAction(camera, pos, zoom).execute();

            renderer.render();
        }, [isActive, data]);

        const close = (cancelled: boolean = false) => {
            // // Block input while closed
            // icInfo.input.block();

            // if (!cancelled) {
            //     if (!data)
            //         throw new Error("ICDesigner.close failed: data was undefined");

            //     // Create IC on center of screen
            //     const ic = new IC(data);
            //     ic.setPos(mainInfo.camera.getPos());

            //     // Deselect other things, create IC and select it
            //     const action = new GroupAction([
            //         CreateDeselectAllAction(mainInfo.selections),
            //         new CreateICDataAction(data, mainInfo.designer),
            //         new PlaceAction(mainInfo.designer, ic),
            //         new SelectAction(mainInfo.selections, ic)
            //     ], "Create IC Action");
            //     mainInfo.history.add(action.execute());
            //     mainInfo.renderer.render();
            // }

            // Unblock main input
            mainInfo.input.unblock();

            // icInfo.ic = undefined;
            dispatch(CloseICEditor());
            // setName({ name: "" }); // Clear name
        }

    //     useKeyDownEvent(info.input, "Escape", close);

        return (
            <div className="iceditor" style={{ display: (isActive ? "initial" : "none"), height: h+"px" }}>
                <canvas ref={canvas}
                        width={w*IC_DESIGNER_VW}
                        height={h*IC_DESIGNER_VH} />

                <div className="iceditor__buttons">
                    <button name="close" onClick={() => close(true)}>
                        Close
                    </button>
                </div>
            </div>
        );
    }
})();
