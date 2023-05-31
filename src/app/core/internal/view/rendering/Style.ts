export interface StrokeStyle {
    color: string;
    size: number;
    lineCap?: "butt" | "round" | "square";
}

export interface Style {
    stroke?: StrokeStyle;
    fill?: string | CanvasGradient;
    alpha?: number;
}
