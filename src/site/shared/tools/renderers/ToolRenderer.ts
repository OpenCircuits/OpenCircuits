import {RenderHelper}  from "core/internal/view/rendering/RenderHelper";
import {RenderOptions} from "core/internal/view/rendering/RenderOptions";
import {Circuit}       from "core/public";

import {InputManagerState} from "shared/utils/input/InputManagerState";

import {Tool} from "../Tool";


export interface ToolRendererProps<T extends Tool = Tool> {
    renderer: RenderHelper;
    options: RenderOptions;

    circuit: Circuit;

    curTool: T;
    input: InputManagerState;
}

export interface ToolRenderer<T extends Tool = Tool> {
    isActive(curTool?: Tool): curTool is T;

    render(props: ToolRendererProps<T>): void;
}
