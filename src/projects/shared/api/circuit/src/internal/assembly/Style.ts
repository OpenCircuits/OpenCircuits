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
}

export interface Style {
    stroke?: StrokeStyle;
    fill?: string | RadialGradientInfo;
    alpha?: number;
}
