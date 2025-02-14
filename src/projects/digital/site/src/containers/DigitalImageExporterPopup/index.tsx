import {useEffect, useLayoutEffect} from "react";

import {DigitalCircuitDesignerController} from "digital/api/circuit/controllers/DigitalCircuitDesignerController";

import {DefaultTool} from "shared/api/circuit/tools/DefaultTool";
import {PanTool}     from "shared/api/circuit/tools/PanTool";

import {ImageExporterPopup} from "shared/containers/ImageExporterPopup";


import "./index.scss";


type Props = {
    mainCircuit: DigitalCircuitDesignerController;
}
export const DigitalImageExporterPopup = (() => {
    const circuit = new DigitalCircuitDesignerController(
        new DefaultTool(),
        PanTool,
    );

    // TODO: Copy over mainCircuit -> circuit

    // eslint-disable-next-line react/display-name
    return ({ mainCircuit }: Props) => {
        // const { backgroundColor } = style;
        // const { useGrid } = renderingOptions;

        // // Re-render when rendering options change
        // useLayoutEffect(() => {
        //     info.renderer.setOptions({ useGrid });
        //     info.renderer.render();
        // }, [useGrid, backgroundColor]);

        // // Initial function called after the canvas first shows up
        // useEffect(() => {
        //     if (!canvas.current)
        //         throw new Error("ImageExporterPreview.useEffect failed: canvas.current is null");
        //     // Get render function
        //     const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

        //     // Input should be blocked initially
        //     info.input.block();

        //     // // Add render callbacks and set render function
        //     // info.designer.addCallback(() => info.renderer.render());

        //     info.renderer.setRenderFunction(renderFunc);
        //     info.renderer.render();

        //     return info.input.setupOn(canvas.current);
        // }, [canvas]); // Pass empty array so that this only runs once on mount

        // // Happens when de/activated
        // useLayoutEffect(() => {
        //     const { camera, input, debugOptions } = mainInfo;

        //     if (!isActive) {
        //         info.input?.block();
        //         input?.unblock();
        //         // info.designer.reset();
        //         return;
        //     }

        //     info.debugOptions = debugOptions;

        //     // // Make a deep copy of the entire designer so that they don't share components
        //     // const copy = Deserialize<DigitalCircuitDesigner>(Serialize(designer));
        //     // info.designer.replace(copy);

        //     // info.camera.resize(width, height);
        //     info.camera.setPos(camera.getPos());
        //     info.camera.setZoom(camera.getZoom());

        //     // Unblock input
        //     info.input.unblock();

        //     // Block input for main designer
        //     input.block();

        //     info.renderer.render();
        // }, [isActive, mainInfo]);

        return (
            <ImageExporterPopup circuit={circuit} />
        );
    }
})();
