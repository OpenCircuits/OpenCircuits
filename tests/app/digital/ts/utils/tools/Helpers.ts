import {Camera} from "math/Camera";

import {Input} from "core/utils/Input";

import {ToolManager} from "core/tools/ToolManager";
import {SelectionTool} from "core/tools/SelectionTool";
import {PanTool} from "core/tools/PanTool";
import {RotateTool} from "core/tools/RotateTool";
import {TranslateTool} from "core/tools/TranslateTool";
import {PlaceComponentTool} from "core/tools/PlaceComponentTool";
import {SplitWireTool} from "core/tools/SplitWireTool";

import {DigitalWiringTool} from "digital/tools/DigitalWiringTool";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

export function InitializeInput(input: Input, toolManager: ToolManager): void {
    input.addListener("keydown",   (b?: number) => { toolManager.onKeyDown(input, b); });
    input.addListener("keyup",     (b?: number) => { toolManager.onKeyUp(input, b); });
    input.addListener("mousedown", (b?: number) => { toolManager.onMouseDown(input, b); });
    input.addListener("mousemove", ()           => { toolManager.onMouseMove(input); });
    input.addListener("mousedrag", (b?: number) => { toolManager.onMouseDrag(input, b); });
    input.addListener("mouseup",   (b?: number) => { toolManager.onMouseUp(input, b); });
    input.addListener("click",     (b?: number) => { toolManager.onClick(input, b); });
}

export function CreateDefaultToolManager(designer: DigitalCircuitDesigner, camera: Camera): ToolManager {
    return new ToolManager(new SelectionTool(designer, camera),
                           new PanTool(camera),
                           new RotateTool(camera),
                           new TranslateTool(camera),
                           new PlaceComponentTool(designer, camera),
                           new DigitalWiringTool(designer, camera),
                           new SplitWireTool(camera));
}