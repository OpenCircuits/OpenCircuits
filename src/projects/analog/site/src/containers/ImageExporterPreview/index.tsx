import {useEffect, useLayoutEffect} from "react";

import {DefaultTool} from "core/tools/DefaultTool";
import {PanTool}     from "core/tools/PanTool";

import {FitToScreenHandler} from "core/tools/handlers/FitToScreenHandler";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {GetRenderFunc} from "shared/utils/GetRenderingFunc";

import {ImageExporterPreviewProps} from "shared/containers/ImageExporterPopup";

import {CreateInfo} from "site/analog/utils/CircuitInfo/CreateInfo";

import "./index.scss";


type Props = ImageExporterPreviewProps & {
    mainInfo: AnalogCircuitInfo;
}
export const ImageExporterPreview = (() => {
    const [info] = CreateInfo(undefined, new DefaultTool(FitToScreenHandler), PanTool);

    // Add input listener
    info.input.subscribe((event) => {
        const change = info.toolManager.onEvent(event, info);
        if (change)
            info.renderer.render();
    });

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
            // Get render function
            const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

            // Input should be blocked initially
            info.input.block();

            // // Add render callbacks and set render function
            // info.designer.addCallback(() => info.renderer.render());

            info.renderer.setRenderFunction(renderFunc);
            info.renderer.render();

            return info.input.setupOn(canvas.current);
        }, [canvas]); // Pass empty array so that this only runs once on mount

        // Happens when de/activated
        useLayoutEffect(() => {
            const { camera, input, debugOptions, circuit } = mainInfo;

            if (!isActive) {
                info.input?.block();
                input?.unblock();
                // info.designer.reset();
                return;
            }

            info.debugOptions = debugOptions;

            // // Make a deep copy of the entire designer so that they don't share components
            // const copy = Deserialize<AnalogCircuitDesigner>(Serialize(designer));
            // info.designer.replace(copy);

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
