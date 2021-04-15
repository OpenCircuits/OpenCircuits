import {useEffect, useLayoutEffect, useRef} from "react";
import {connect} from "react-redux";

import {IC_VIEWER_ZOOM_PADDING_RATIO} from "core/utils/Constants";
import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/digital/utils/Constants";

import {Input}        from "core/utils/Input";
import {GetCameraFit} from "core/utils/ComponentUtils";

import {CullableObject} from "core/models";

import {MoveCameraAction} from "core/actions/camera/MoveCameraAction";
import {InteractionTool}  from "core/tools/InteractionTool";
import {PanTool}          from "core/tools/PanTool";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {ICData} from "digital/models/ioobjects/other/ICData";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import {CreateInfo}    from "site/digital/utils/CircuitInfo/CreateInfo";
import {GetRenderFunc} from "site/digital/utils/Rendering";

import {AppState} from "site/digital/state";
import {CloseICViewer} from "site/digital/state/ICViewer/actions";

import "./index.scss";


type OwnProps = {
    mainInfo: DigitalCircuitInfo;
}
type StateProps = {
    active: boolean;
    data: ICData;
}
type DispatchProps = {
    CloseICViewer: typeof CloseICViewer;
}

type Props = StateProps & DispatchProps & OwnProps;
export const ICViewer = (() => {
    const info = CreateInfo(new InteractionTool([]), PanTool);

    return connect<StateProps, DispatchProps, OwnProps, AppState>(
        (state: AppState) => ({ active: state.icViewer.active,
                                data: state.icViewer.ic }),
        { CloseICViewer }
    )(
        ({active, data, mainInfo, CloseICViewer}: Props) => {
            const {camera, designer, history, selections, toolManager, renderer} = info;

            const {w, h} = useWindowSize();
            const canvas = useRef<HTMLCanvasElement>();

            // On resize (useLayoutEffect happens sychronously so
            //  there's no pause/glitch when resizing the screen)
            useLayoutEffect(() => {
                if (!active)
                    return;
                camera.resize(w*IC_DESIGNER_VW, h*IC_DESIGNER_VH); // Update camera size when w/h changes
                renderer.render(); // Re-render
            }, [active, w, h]);


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

            // Happens when activated
            useLayoutEffect(() => {
                if (!active || !data)
                    return;
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
            }, [active, data]);


            const close = () => {
                // Block input while closed
                info.input.block();

                // Unblock main input
                mainInfo.input.unblock();

                CloseICViewer();
            }


            return (
                <div className="icviewer" style={{ display: (active ? "initial" : "none") }}>
                    <canvas ref={canvas}
                            width={w*IC_DESIGNER_VW}
                            height={h*IC_DESIGNER_VH} />

                    <div className="icviewer__buttons">
                        <button name="close" onClick={close}>
                            Close
                        </button>
                    </div>
                </div>
            );
        }
    );
})();
