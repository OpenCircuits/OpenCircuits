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

import {useDigitalDispatch, useDigitalSelector} from "site/digital/utils/hooks/useDigital";
import {CreateInfo}    from "site/digital/utils/CircuitInfo/CreateInfo";
import {GetRenderFunc} from "site/digital/utils/Rendering";

import {CloseICEditor} from "site/digital/state/ICEditor";

import "./index.scss";
import { CreateGroupPlaceAction } from "core/actions/addition/PlaceAction";
import { FitToScreenHandler } from "core/tools/handlers/FitToScreenHandler";
import { RedoHandler } from "core/tools/handlers/RedoHandler";
import { UndoHandler } from "core/tools/handlers/UndoHandler";
import { ICCircuitInfo } from "digital/utils/ICCircuitInfo";
import { RotateTool } from "core/tools/RotateTool";
import { SelectionBoxTool } from "core/tools/SelectionBoxTool";
import { SplitWireTool } from "core/tools/SplitWireTool";
import { TranslateTool } from "core/tools/TranslateTool";
import { WiringTool } from "core/tools/WiringTool";
import { CleanUpHandler } from "core/tools/handlers/CleanUpHandler";
import { CopyHandler } from "core/tools/handlers/CopyHandler";
import { DeselectAllHandler } from "core/tools/handlers/DeselectAllHandler";
import { DuplicateHandler } from "core/tools/handlers/DuplicateHandler";
import { PasteHandler } from "core/tools/handlers/PasteHandler";
import { SelectAllHandler } from "core/tools/handlers/SelectAllHandler";
import { SelectionHandler } from "core/tools/handlers/SelectionHandler";
import { SelectPathHandler } from "core/tools/handlers/SelectPathHandler";
import { SnipWirePortsHandler } from "core/tools/handlers/SnipWirePortsHandler";
import { DigitalPaste } from "site/digital/utils/DigitalPaste";
import { InputField } from "shared/components/InputField";
import { Droppable } from "shared/components/DragDroppable/Droppable";
import { SmartPlaceOptions, SmartPlace, DigitalCreateN } from "site/digital/utils/DigitalCreate";
import { V } from "Vector";


type Props = {
    mainInfo: DigitalCircuitInfo;
}
export const ICEditor = (() => {
    // TODO there has to be a better way of doing this elephant
    const handlers = [CleanUpHandler, CopyHandler, DeselectAllHandler,
                      DuplicateHandler, FitToScreenHandler,
                      RedoHandler, SelectAllHandler, SelectionHandler,
                      SelectPathHandler, SnipWirePortsHandler, UndoHandler,
                      PasteHandler((data) => DigitalPaste(data, info, undefined))];
    const info = CreateInfo(
        new InteractionTool(handlers),
        PanTool, RotateTool, SelectionBoxTool,
        SplitWireTool, TranslateTool, WiringTool
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
        const [{name}, setName] = useState({ name: "" });

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

        // Keeps the ICData/IC name's in sync with `name`
        useLayoutEffect(() => {
            if (!data || !icInfo.ic)
                return;
            data.setName(name ?? "");
            icInfo.ic.update();
            renderer.render();
        }, [name, data, icInfo.ic]);

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

            // Get name
            setName({name: data.getName()});

            // Adjust the camera so it all fits in the viewer
            const [pos, zoom] = GetCameraFit(camera, inside.toList() as CullableObject[], IC_VIEWER_ZOOM_PADDING_RATIO);
            new MoveCameraAction(camera, pos, zoom).execute();

            // TODO figure out alternative method elephant
            (document.getElementsByClassName("itemnav")[0] as HTMLElement).style.zIndex = "7";

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
            (document.getElementsByClassName("itemnav")[0] as HTMLElement).style.zIndex = "2";
            // setName({ name: "" }); // Clear name
        }

    //     useKeyDownEvent(info.input, "Escape", close);

        return (
            <div className="iceditor" style={{display: (isActive ? "initial" : "none"), height: h+"px"}}>
                <Droppable ref={canvas}
                        onDrop={(pos, itemId, num, smartPlaceOptions: SmartPlaceOptions) => {
                            if (!canvas.current)
                                throw new Error("ICEditor.Droppable.onDrop failed: canvas.current is null");
                            num = num ?? 1;
                            if (!itemId || !(typeof itemId === "string") || !(typeof num === "number"))
                                return;
                            pos = camera.getWorldPos(pos.sub(V(0, canvas.current.getBoundingClientRect().top)));

                            if (smartPlaceOptions !== SmartPlaceOptions.Off) {
                                icInfo.history.add(SmartPlace(pos, itemId, designer, num, smartPlaceOptions).execute());
                            } else {
                                icInfo.history.add(
                                    CreateGroupPlaceAction(designer, DigitalCreateN(pos, itemId, designer, num)).execute()
                                );
                            }
                            renderer.render();
                        }}>
                    <canvas ref={canvas}
                            width={w*IC_DESIGNER_VW}
                            height={h*IC_DESIGNER_VH} />
                </Droppable>

                <InputField type="text"
                            value={name}
                            placeholder="IC Name"
                            onChange={(ev) => setName({name: ev.target.value})} />

                <div className="icdesigner__buttons">
                    <button name="confirm" onClick={() => close(false)}>
                        Confirm
                    </button>
                    <button name="cancel"  onClick={() => close(true)}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
})();
