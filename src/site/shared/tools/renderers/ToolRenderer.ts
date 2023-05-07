import {RenderHelper}  from "core/internal/view/rendering/RenderHelper";
import {RenderOptions} from "core/internal/view/rendering/RenderOptions";
import {Circuit}       from "core/public";

import {UserInputState} from "shared/utils/input/UserInputState";

import {Tool} from "../Tool";


export interface ToolRendererArgs {
    renderer: RenderHelper;
    options: RenderOptions;

    circuit: Circuit;

    curTool?: Tool;
    input: UserInputState;
}

export interface ToolRenderer {
    render(props: ToolRendererArgs): void;
}
