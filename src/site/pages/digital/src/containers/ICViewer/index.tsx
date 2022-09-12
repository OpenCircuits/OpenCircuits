import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";

import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/digital/utils/Constants";

import {CircuitInfo}             from "core/utils/CircuitInfo";
import {CopyGroup, GetCameraFit} from "core/utils/ComponentUtils";
import {Event}                   from "core/utils/Events";
import {Input}                   from "core/utils/Input";
import {isPressable}             from "core/utils/Pressable";

import {AddGroup} from "core/actions/compositions/AddGroup";

import {SetProperty} from "core/actions/units/SetProperty";

import {InteractionTool} from "core/tools/InteractionTool";
import {PanTool}         from "core/tools/PanTool";

import {CullableObject} from "core/models";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {Button, Switch} from "digital/models/ioobjects/inputs";

import {useKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";
import {useWindowSize}   from "shared/utils/hooks/useWindowSize";

import {GetRenderFunc} from "site/digital/utils/Rendering";

import {CreateInfo} from "site/digital/utils/CircuitInfo/CreateInfo";

import {useDigitalDispatch, useDigitalSelector} from "site/digital/utils/hooks/useDigital";

import {CloseICViewer} from "site/digital/state/ICViewer";

import "./index.scss";


const IC_VIEWER_ZOOM_PADDING_RATIO = 1.5;

function CheckForInteraction(ev: Event, { toolManager, camera, designer, input, currentlyPressedObject }: CircuitInfo) {
    if (toolManager.getCurrentTool() instanceof InteractionTool) {
        const worldMousePos = camera.getWorldPos(input.getMousePos());
        const obj = designer.getObjects().reverse()
            .find((p) => isPressable(p) && p.isWithinPressBounds(worldMousePos));

        // Check if Switch was clicked
        if (obj instanceof Switch && ev.type === "click")
            return true;

        // Or if Button was pressed/released
        if (currentlyPressedObject === obj && obj instanceof Button
                 && (ev.type === "mousedown" || ev.type === "mouseup"))
            return true;
    }
    return false;
}


type Props = {
    mainInfo: DigitalCircuitInfo;
}
export const ICViewer = (() => {
    const info = CreateInfo(new InteractionTool([]), PanTool);

    // eslint-disable-next-line react/display-name
    return ({ mainInfo }: Props) => {
        const { isActive, ic } = useDigitalSelector(
            (state) => ({ ...state.icViewer })
        );
        const dispatch = useDigitalDispatch();

        const { w, h } = useWindowSize();
        const canvas = useRef<HTMLCanvasElement>(null);

        // State controller for main designer callback
        const [pauseUpdates, setPauseUpdates] = useState(false);

        const updateViewer = useCallback(() => {
            if (!ic)
                return;
            // loop through all the inputs for this IC
            //  set their input value to be what the info.designer has for their input
            const viewerInputs = info.designer.getObjects().filter(
                (input) => [Switch, Button].some((type) => input instanceof type)
            );
            for (let i = 0; i < viewerInputs.length; ++i)
                viewerInputs[i].activate(ic.getInputPort(i).getIsOn());
        }, [ic]);

        // On resize (useLayoutEffect happens sychronously so
        //  there's no pause/glitch when resizing the screen)
        useLayoutEffect(() => {
            if (!isActive)
                return;
            info.camera.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH); // Update camera size when w/h changes
            info.renderer.render(); // Re-render
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
                const change = info.toolManager.onEvent(event, info);
                if (!change)
                    return;

                info.renderer.render();
                if (CheckForInteraction(event, info))
                    setPauseUpdates(true);
            });

            // Input should be blocked initially
            info.input.block();

            // Add render callbacks and set render function
            info.designer.addCallback(() => info.renderer.render());

            info.renderer.setRenderFunction(() => renderFunc());
            info.renderer.render();
        }, []); // Pass empty array so that this only runs once on mount

        // Synchronize the inputs in the original designer and this IC viewer
        //  (issue #754)
        useEffect(() => {
            if (pauseUpdates)
                return; // if paused, don't add callback
            mainInfo.designer.addCallback(updateViewer);
            // remove callback when done
            return () => mainInfo.designer.removeCallback(updateViewer);
        }, [pauseUpdates, mainInfo, updateViewer]);

        // Happens when activated
        useLayoutEffect(() => {
            if (!isActive || !ic)
                return;

            const { input } = mainInfo;

            // Retrieve current debug info from mainInfo
            info.debugOptions = mainInfo.debugOptions;

            // Unlock input
            info.input.unblock();

            // Block input for main designer
            input.block();

            // Reset designer and add IC insides
            info.designer.reset();
            const inside = CopyGroup(ic.getCollection().toList());
            AddGroup(info.designer, inside);

            // Adjust the camera so it all fits in the viewer
            const [pos, zoom] = GetCameraFit(
                info.camera, inside.toList() as CullableObject[], IC_VIEWER_ZOOM_PADDING_RATIO
            );
            SetProperty(info.camera, "pos", pos);
            SetProperty(info.camera, "zoom", zoom);

            updateViewer();
            info.renderer.render();
        }, [mainInfo, isActive, ic, updateViewer]);

        const close = () => {
            // Reset in case for next time
            setPauseUpdates(false);

            // Block input while closed
            info.input.block();

            // Unblock main input
            mainInfo.input.unblock();

            dispatch(CloseICViewer());
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
                    <button type="button" name="close" onClick={close}>
                        Close
                    </button>
                    <button type="button" name="restore" disabled={!pauseUpdates} onClick={restore}>
                        Restore
                    </button>
                </div>
            </div>
        );
    }
})();
