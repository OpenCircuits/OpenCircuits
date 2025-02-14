// import {RenderHelper}  from "shared/api/circuit/internal/view/rendering/RenderHelper";
// import {RenderOptions} from "shared/api/circuit/internal/view/rendering/RenderOptions";
import {Circuit}       from "shared/api/circuit/public";

import {RenderOptions} from "shared/api/circuit/internal/assembly/RenderOptions";

import {UserInputState} from "shared/api/circuitdesigner/input/UserInputState";
import {RenderHelper}   from "shared/api/circuitdesigner/public/impl/rendering/RenderHelper";

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
