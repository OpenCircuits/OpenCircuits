

export class Style {
    public readonly fillColor?: string | CanvasGradient;
    public readonly strokeColor?: string;

    public readonly strokeSize?: number;

    public constructor(fillColor?: string | CanvasGradient, strokeColor?: string, strokeSize?: number) {
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.strokeSize = strokeSize;
    }

    public fill(): boolean {
        return (this.fillColor !== undefined);
    }

    public stroke(): boolean {
        return (this.strokeColor !== undefined && this.strokeSize !== undefined && this.strokeSize > 0);
    }
}
