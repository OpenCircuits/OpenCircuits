import {useEffect, useLayoutEffect, useRef, useState} from "react";

import {IC_VIEWER_ZOOM_PADDING_RATIO} from "core/utils/Constants";
import {IC_DESIGNER_VH, IC_DESIGNER_VW} from "site/digital/utils/Constants";

import {Input}        from "core/utils/Input";
import {CopyGroup, GetCameraFit} from "core/utils/ComponentUtils";

import {Component, CullableObject, IOObject} from "core/models";

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
import { useKeyDownEvent } from "shared/utils/hooks/useKeyDownEvent";
import { SelectionPopup } from "shared/containers/SelectionPopup";
import { PositionModule } from "shared/containers/SelectionPopup/modules/PositionModule";
import { BusButtonModule } from "../SelectionPopup/modules/BusButtonModule";
import { ClockSyncButtonModule } from "../SelectionPopup/modules/ClockSyncButtonModule";
import { ColorModule } from "../SelectionPopup/modules/ColorModule";
import { ComparatorInputCountModule } from "../SelectionPopup/modules/ComparatorInputCountModule";
import { ConstantNumberInputModule } from "../SelectionPopup/modules/ConstantNumberInputModule";
import { CreateICButtonModule } from "../SelectionPopup/modules/CreateICButtonModule";
import { DecoderInputCountModule } from "../SelectionPopup/modules/DecoderInputCountModule";
import { EditICButtonModule } from "../SelectionPopup/modules/EditICButtonModule";
import { FrequencyModule } from "../SelectionPopup/modules/FrequencyModule";
import { InputCountModule } from "../SelectionPopup/modules/InputCountModule";
import { OutputCountModule } from "../SelectionPopup/modules/OutputCountModule";
import { PauseResumeButtonModule } from "../SelectionPopup/modules/PauseResumeButtonModules";
import { SegmentCountModule } from "../SelectionPopup/modules/SegmentCountModule";
import { SelectPortCountModule } from "../SelectionPopup/modules/SelectPortCountModule";
import { TextColorModule } from "../SelectionPopup/modules/TextColorModule";
import { ViewICButtonModule } from "../SelectionPopup/modules/ViewICButtonModule";

import docsConfig from "site/digital/data/docsUrlConfig.json";
import { HistoryBox } from "shared/containers/HistoryBox";
import { DeleteHandler } from "core/tools/handlers/DeleteHandler";
import { IC, ICData } from "digital/models/ioobjects";
import { EditICDataAction } from "digital/actions/EditICDataAction";
import { GroupAction } from "core/actions/GroupAction";
import { DigitalWire } from "digital/models/DigitalWire";
import { DisconnectAction } from "core/actions/addition/ConnectionAction";
import { OscilloscopeModule } from "../SelectionPopup/modules/OscilloscopeModules";

type Props = {
    mainInfo: DigitalCircuitInfo;
}
export const ICEditor = (() => {
    const handlers = [CleanUpHandler, CopyHandler, DeselectAllHandler,
                      DeleteHandler, DuplicateHandler, FitToScreenHandler,
                      RedoHandler, SelectAllHandler, SelectionHandler,
                      SelectPathHandler, SnipWirePortsHandler, UndoHandler,
                      PasteHandler((data) => DigitalPaste(data, icInfo, undefined))];

    const info = CreateInfo(
        new InteractionTool(handlers),
        PanTool, RotateTool, SelectionBoxTool,
        SplitWireTool, TranslateTool, WiringTool
    );

    const icInfo: ICCircuitInfo = {
        ...info
    };

    return ({ mainInfo }: Props) => {
        const {camera, designer, toolManager, renderer} = icInfo;

        const {isActive, ic: data} = useDigitalSelector(
            state => ({ ...state.icEditor })
        );
        const dispatch = useDigitalDispatch();

        const {w, h} = useWindowSize();
        const canvas = useRef<HTMLCanvasElement>(null);
        const historyBox = useRef<HTMLCanvasElement>(null);
        const [{name}, setName] = useState({ name: "" });
        let prevCollection: IOObject[];
        let prevName: string;

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
            icInfo.input = new Input(canvas.current);

            // Get render function
            const renderFunc = GetRenderFunc({ canvas: canvas.current, info });

            // Add input listener
            icInfo.input.addListener((event) => {
                const change = toolManager.onEvent(event, icInfo);
                if (change) renderer.render();
            });

            // Input should be blocked initially
            icInfo.input.block();

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
            icInfo.debugOptions = mainInfo.debugOptions;

            // Unlock input
            icInfo.input.unblock();

            // Block input for main designer
            mainInfo.input.block();

            // Reset designer and add IC insides
            designer.reset();
            const inside = data.copy();
            designer.addGroup(inside);

            // Get name
            setName({name: data.getName()});

            // Get initial state
            prevCollection = icInfo.designer.getAll();
            prevName = name;

            // Adjust the camera so it all fits in the viewer
            const [pos, zoom] = GetCameraFit(camera, inside.toList() as CullableObject[], IC_VIEWER_ZOOM_PADDING_RATIO);
            new MoveCameraAction(camera, pos, zoom).execute();

            // TODO figure out alternative method elephant
            (document.getElementsByClassName("itemnav")[0] as HTMLElement).style.zIndex = "7";

            renderer.render();
        }, [isActive, data]);

        const close = (cancelled: boolean = false) => {
            // Block input while closed
            icInfo.input.block();

            if (!cancelled) {
                if (!data)
                    throw new Error("ICEditor.close failed: data was undefined");

                let ic = mainInfo.selections.get()[0] as IC;
                const oldInputCount = ic.getData().getInputCount();
                const oldOutputCount = ic.getData().getOutputCount();

                console.log("ic.getInputPorts()");
                console.log(ic.getInputPorts());
                console.log("ic.getOutputPorts()");
                console.log(ic.getOutputPorts());

                let inputObjs: Component[] = [];
                ic.getInputPorts().forEach((p) => {
                    inputObjs.push(p.getWires()[0].getP1Component());
                });
                console.log("Input Objects: " + inputObjs);
                console.log(inputObjs);

                let outputObjs: Component[] = [];
                ic.getOutputPorts().forEach((p) => {
                    outputObjs.push(p.getWires()[0].getP1Component());
                });
                console.log("Output Objects: " + outputObjs);
                console.log(outputObjs);

                console.log(ic);
                console.log("Old input count was " + oldInputCount);
                console.log("Old output count was " + oldOutputCount);

                const newICData = ICData.Create(icInfo.designer.getAll());
                if (!newICData)
                    throw new Error("ICEditor.close failed: unable to create new ICData");
                const newInputCount = newICData.getInputCount();
                const newOutputCount = newICData.getOutputCount();

                console.log("New input count is " + newInputCount);
                console.log("New output count is " + newOutputCount);

                // Create Edit action to update all ICData
                const editICAction = new GroupAction([
                    new EditICDataAction(
                        mainInfo.designer, ic,
                        prevCollection, prevName,
                        icInfo.designer.getAll(), name
                    )
                ], "Edit IC Action");

                for (let i = oldInputCount - 1; i >= newInputCount; --i) {
                    console.log(inputObjs[i].getName());
                    editICAction.add(new DisconnectAction(mainInfo.designer, inputObjs[i].getConnections()[0]));
                }

                for (let i = oldOutputCount - 1; i >= newOutputCount; --i) {
                    console.log(inputObjs[i].getName());
                    editICAction.add(new DisconnectAction(mainInfo.designer, inputObjs[i].getConnections()[0]));
                }

                ic.setInputPortCount(newInputCount);
                ic.setOutputPortCount(newOutputCount);

                mainInfo.history.add(editICAction.execute());

                mainInfo.renderer.render();
            }

            // Unblock main input
            mainInfo.input.unblock();

            icInfo.ic = undefined;
            icInfo.history.reset();
            dispatch(CloseICEditor());
            (document.getElementsByClassName("itemnav")[0] as HTMLElement).style.zIndex = "2";
            setName({ name: "" }); // Clear name
        }

        useKeyDownEvent(icInfo.input, "Escape", () => close(true),  [data, mainInfo]);
        useKeyDownEvent(icInfo.input, "Enter",  () => close(false), [data, mainInfo]);

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

                <HistoryBox info={icInfo} />
                <SelectionPopup info={info}
                                docsUrlConfig={docsConfig}>
                    <PositionModule info={info} />
                    <InputCountModule info={info} />
                    <ComparatorInputCountModule info={info} />
                    <SelectPortCountModule info={info} />
                    <ConstantNumberInputModule info={info} />
                    <DecoderInputCountModule info={info} />
                    <OutputCountModule info={info} />
                    <SegmentCountModule info={info} />
                    <FrequencyModule info={info} />
                    <PauseResumeButtonModule info={info} />
                    <ClockSyncButtonModule info={info} />
                    <OscilloscopeModule info={info} />
                    <ColorModule info={info} />
                    <TextColorModule info={info} />
                    <BusButtonModule info={info} />
                    <CreateICButtonModule info={info} />
                    <ViewICButtonModule info={info} />
                </SelectionPopup>

                <InputField type="text"
                            value={name}
                            placeholder="IC Name"
                            onChange={(ev) => setName({name: ev.target.value})} />

                <div className="iceditor__buttons">
                    <button name="confirm" onClick={() => close(false)}>
                        &#10003;
                    </button>
                    <button name="cancel"  onClick={() => close(true)}>
                        &#10007;
                    </button>
                </div>
            </div>
        );
    }
})();
