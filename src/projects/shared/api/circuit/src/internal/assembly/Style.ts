import {Vector} from "Vector";


export interface RadialGradientInfo {
    pos1: Vector;
    radius1: number;

    pos2: Vector;
    radius2: number;

    colorStops: Array<[number, string]>;
}

export interface StrokeStyle {
    color: string;
    size: number;
    lineCap?: "butt" | "round" | "square";
    lineJoin?: "round" | "bevel" | "miter";
}

export interface Style {
    stroke?: StrokeStyle;
    fill?: string | RadialGradientInfo;
    alpha?: number;
}

// type based on CanvasTextBaseline
export type TextBaseline = "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
// type based on CanvasTextAlign
export type TextAlign = "left" | "right" | "center" | "start" | "end";
export interface FontStyle {
    textBaseline: TextBaseline;
    textAlign: TextAlign;
    font: string;
    color: string;
}
