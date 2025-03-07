import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";
import {RenderHelper}    from "shared/api/circuitdesigner/public/Viewport";


export interface ToolRendererArgs {
    designer: CircuitDesigner;
    renderer: RenderHelper;
    // options: RenderOptions;
    // input: UserInputState;
}

export interface ToolRenderer {
    render(props: ToolRendererArgs): void;
}
