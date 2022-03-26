import {useEffect, useLayoutEffect, useRef, useState} from "react";

import {IC_VIEWER_ZOOM_PADDING_RATIO} from "core/utils/Constants";
import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/digital/utils/Constants";

import {Input}        from "core/utils/Input";
import {CopyGroup, GetCameraFit} from "core/utils/ComponentUtils";
import {isPressable} from "core/utils/Pressable";

import {MoveCameraAction} from "core/actions/camera/MoveCameraAction";
import {InteractionTool}  from "core/tools/InteractionTool";
import {PanTool}          from "core/tools/PanTool";

import {CullableObject} from "core/models";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {Button, Switch} from "digital/models/ioobjects/inputs";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";
import {useKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";

import {useDigitalDispatch, useDigitalSelector} from "site/digital/utils/hooks/useDigital";
import {CreateInfo}    from "site/digital/utils/CircuitInfo/CreateInfo";
import {GetRenderFunc} from "site/digital/utils/Rendering";

import {CloseICViewer} from "site/digital/state/ICViewer";

import "./index.scss";


type Props = {
    mainInfo: DigitalCircuitInfo;
}
export const ICViewer = (() => {
    const info = CreateInfo(new InteractionTool([]), PanTool);

    return ({ mainInfo }: Props) => {
        const {camera, designer, toolManager, renderer} = info;

        const {isActive, ic} = useDigitalSelector(
            state => ({ ...state.icViewer })
        );
        const dispatch = useDigitalDispatch();

        const {w, h} = useWindowSize();
        const canvas = useRef<HTMLCanvasElement>(null);

        // State controller for main designer callback
        const [pauseUpdates, setPauseUpdates] = useState(false);

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
                throw new Error("ICViewer.useEffect failed: canvas.current is null");

            // Create input w/ canvas
            info.input = new Input(canvas.current);

            // Get render function
            const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

            // Add input listener
            info.input.addListener((event) => {
                const change = toolManager.onEvent(event, info);
                if (change) {
                    renderer.render();
                    if (toolManager.getCurrentTool() instanceof InteractionTool) {
                        const worldMousePos = camera.getWorldPos(info.input.getMousePos());
                        const obj = info.designer.getObjects().reverse()
                            .find(p => isPressable(p) && p.isWithinPressBounds(worldMousePos));
                        if (obj instanceof Switch && event.type === "click")
                            setPauseUpdates(true);
                        else if (info.currentlyPressedObject === obj && obj instanceof Button
                                 && (event.type === "mousedown" || event.type === "mouseup"))
                            setPauseUpdates(true);
                    }
                }
            });

            // Input should be blocked initially
            info.input.block();

            // Add render callbacks and set render function
            designer.addCallback(() => renderer.render());

            renderer.setRenderFunction(() => renderFunc());
            renderer.render();
        }, []); // Pass empty array so that this only runs once on mount

        // Synchronize the inputs in the original designer and this IC viewer
        //  (issue #754)
        useEffect(() => {
            if (pauseUpdates)
                return; // if paused, don't add callback
            mainInfo.designer.addCallback(updateViewer);
            // remove callback when done
            return () => mainInfo.designer.removeCallback(updateViewer);
        }, [pauseUpdates, ic]);

        // Happens when activated
        useLayoutEffect(() => {
            if (!isActive || !ic)
                return;

            // Retrieve current debug info from mainInfo
            info.debugOptions = mainInfo.debugOptions;

            // Unlock input
            info.input.unblock();

            // Block input for main designer
            mainInfo.input.block();

            // Reset designer and add IC insides
            designer.reset();
            const inside = CopyGroup(ic.getCollection().toList());
            designer.addGroup(inside);

            // Adjust the camera so it all fits in the viewer
            const [pos, zoom] = GetCameraFit(camera, inside.toList() as CullableObject[], IC_VIEWER_ZOOM_PADDING_RATIO);
            new MoveCameraAction(camera, pos, zoom).execute();

            updateViewer();
            renderer.render();
        }, [isActive, ic]);

        const close = () => {
            // Reset in case for next time
            setPauseUpdates(false);

            // Block input while closed
            info.input.block();

            // Unblock main input
            mainInfo.input.unblock();

            dispatch(CloseICViewer());
        }

        const updateViewer = () => {
            if (!ic) return;
            // loop through all the inputs for this IC
            //  set their input value to be what the info.designer has for their input
            const viewerInputs = designer.getObjects().filter(i => [Switch, Button].some((type) => i instanceof type));
            for (let i = 0; i < viewerInputs.length; ++i)
                viewerInputs[i].activate(ic.getInputPort(i).getIsOn());
        }

        const restore = () => {
            setPauseUpdates(false);
            updateViewer();
        }

        useKeyDownEvent(info.input, "Escape", close);

        return (
            <div className="icviewer" style={{ display: (isActive ? "initial" : "none"), height: h+"px" }}>
                <canvas ref={canvas}
                        width={w*IC_DESIGNER_VW}
                        height={h*IC_DESIGNER_VH} />

                <div className="icviewer__buttons">
                    <button name="close" onClick={close}>
                        Close
                    </button>
                    <button name="restore" disabled={!pauseUpdates} onClick={restore}>
                        Restore
                    </button>
                </div>
            </div>
        );
    }
})();
