import {Style} from "./Style";


export interface RenderOptions {
    showGrid: boolean;

    gridSize: number;
    gridStyle: Style;
}


export const defaultRenderOptions: RenderOptions = {
    showGrid: true,

    gridSize: 1,
    gridStyle: new Style(undefined, "#999999", 0.02),
}
