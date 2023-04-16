import {RenderHelper}  from "core/internal/view/rendering/RenderHelper";
import {RenderOptions} from "core/internal/view/rendering/RenderOptions";
import {Circuit}       from "core/public";

import {UserInputState} from "shared/utils/input/UserInputState";

import {Tool} from "../Tool";


export interface ToolRendererArgs<T extends Tool = Tool> {
    renderer: RenderHelper;
    options: RenderOptions;

    circuit: Circuit;

    curTool: T;
    input: UserInputState;
}

export interface ToolRenderer<T extends Tool = Tool> {
    isActive(curTool?: Tool): curTool is T;

    render(props: ToolRendererArgs<T>): void;
}
