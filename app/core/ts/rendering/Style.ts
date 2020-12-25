
export class Style {

    public readonly fillColor?: string | CanvasGradient;
    public readonly borderColor?: string;

    public readonly borderSize?: number;

    public constructor(fillColor?: string | CanvasGradient, borderColor?: string, borderSize?: number) {
        this.fillColor = fillColor;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
    }

    public fill(): boolean {
        return (this.fillColor != null);
    }

    public stroke(): boolean {
        return (this.borderColor != null && this.borderSize > 0);
    }

}
