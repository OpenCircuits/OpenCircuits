import {useEffect, useLayoutEffect} from "react";
import {Deserialize, Serialize}     from "serialeazy";

import {Input} from "core/utils/Input";

import {InteractionTool} from "core/tools/InteractionTool";
import {PanTool}         from "core/tools/PanTool";

import {FitToScreenHandler} from "core/tools/handlers/FitToScreenHandler";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {DigitalCircuitDesigner} from "digital/models";

import {ImageExporterPreviewProps} from "shared/containers/ImageExporterPopup";

import {GetRenderFunc} from "site/digital/utils/Rendering";

import {CreateInfo} from "site/digital/utils/CircuitInfo/CreateInfo";

import "./index.scss";


type Props = ImageExporterPreviewProps & {
    mainInfo: DigitalCircuitInfo;
}
export const ImageExporterPreview = (() => {
    const info = CreateInfo(new InteractionTool([FitToScreenHandler]), PanTool);

    // eslint-disable-next-line react/display-name
    return ({ mainInfo, isActive, canvas, width, height, style, ...renderingOptions }: Props) => {
        const { backgroundColor } = style;
        const { useGrid } = renderingOptions;

        // On resize (useLayoutEffect happens sychronously so
        //  there's no pause/glitch when resizing the screen)
        useLayoutEffect(() => {
            if (!isActive)
                return;
            info.camera.resize(width, height); // Update camera size when w/h changes
            info.renderer.render(); // Re-render
        }, [isActive, width, height]);

        // Re-render when rendering options change
        useLayoutEffect(() => {
            info.renderer.setOptions({ useGrid });
            info.renderer.render();
        }, [useGrid, backgroundColor]);

        // Initial function called after the canvas first shows up
        useEffect(() => {
            if (!canvas.current)
                throw new Error("ImageExporterPreview.useEffect failed: canvas.current is null");
            // Create input w/ canvas
            info.input = new Input(canvas.current);

            // Get render function
            const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

            // Add input listener
            info.input.addListener((event) => {
                const change = info.toolManager.onEvent(event, info);
                if (change)
                    info.renderer.render();
            });

            // Input should be blocked initially
            info.input.block();

            // Add render callbacks and set render function
            info.designer.addCallback(() => info.renderer.render());

            info.renderer.setRenderFunction(renderFunc);
            info.renderer.render();
        }, [canvas]); // Pass empty array so that this only runs once on mount

        // Happens when de/activated
        useLayoutEffect(() => {
            const { camera, input, debugOptions, designer } = mainInfo;

            if (!isActive) {
                info.input?.block();
                input?.unblock();
                info.designer.reset();
                return;
            }

            info.debugOptions = debugOptions;

            // Make a deep copy of the entire designer so that they don't share components
            const copy = Deserialize<DigitalCircuitDesigner>(Serialize(designer));
            info.designer.replace(copy);

            // info.camera.resize(width, height);
            info.camera.setPos(camera.getPos());
            info.camera.setZoom(camera.getZoom());

            // Unblock input
            info.input.unblock();

            // Block input for main designer
            input.block();

            info.renderer.render();
        }, [isActive, mainInfo]);

        return (<>
            <img src="img/icons/fitscreen.svg"
                 className="image-exporter-preview__button"
                 alt="Fit to screen"
                 onClick={() => {
                    FitToScreenHandler.getResponse(info);
                    info.renderer.render();
                 }} />
            <canvas ref={canvas}
                    width={`${width}px`}
                    height={`${height}px`}
                    style={style} />
        </>);
    }
})();
