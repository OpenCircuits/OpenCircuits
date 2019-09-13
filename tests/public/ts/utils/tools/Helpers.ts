import {Input} from "core/utils/Input";
import {ToolManager} from "digital/tools/ToolManager";

export function InitializeInput(input: Input, toolManager: ToolManager): void {
    input.addListener("keydown",   (b?: number) => { toolManager.onKeyDown(input, b); });
    input.addListener("keyup",     (b?: number) => { toolManager.onKeyUp(input, b); });
    input.addListener("mousedown", (b?: number) => { toolManager.onMouseDown(input, b); });
    input.addListener("mousemove", ()           => { toolManager.onMouseMove(input); });
    input.addListener("mousedrag", (b?: number) => { toolManager.onMouseDrag(input, b); });
    input.addListener("mouseup",   (b?: number) => { toolManager.onMouseUp(input, b); });
    input.addListener("click",     (b?: number) => { toolManager.onClick(input, b); });
}
