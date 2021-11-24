import {useEffect, useLayoutEffect, useRef} from "react";

import {ESC_KEY, IC_VIEWER_ZOOM_PADDING_RATIO} from "core/utils/Constants";
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

import {CloseICViewer} from "site/digital/state/ICViewer";

import "./index.scss";
import {ImageExporterPreviewProps} from "shared/containers/ImageExporterPopup";


type Props = ImageExporterPreviewProps & {
    mainInfo: DigitalCircuitInfo;
}
export const ImageExporterPreview = (() => {
    const info = CreateInfo(new InteractionTool([]), PanTool);

    return ({ mainInfo, isActive, canvas, width, height, style }: Props) => {
        const {camera, designer, toolManager, renderer} = info;

        // On resize (useLayoutEffect happens sychronously so
        //  there's no pause/glitch when resizing the screen)
        useLayoutEffect(() => {
            if (!isActive)
                return;
            camera.resize(width, height); // Update camera size when w/h changes
            renderer.render(); // Re-render
        }, [isActive, width, height]);

        // Initial function called after the canvas first shows up
        useEffect(() => {
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

        // Happens when de/activated
        useLayoutEffect(() => {
            if (!isActive) {
                info.input?.block();
                mainInfo.input?.unblock();
                return;
            }

            info.designer.replace(mainInfo.designer);
            info.camera.setPos(mainInfo.camera.getPos());
            info.camera.setZoom(mainInfo.camera.getZoom());

            // Unblock input
            info.input.unblock();

            // Block input for main designer
            mainInfo.input.block();

            renderer.render();
        }, [isActive]);

        return (
            <canvas ref={canvas}
                    width={`${width}px`}
                    height={`${height}px`}
                    style={style} />
        );
    }
})();
