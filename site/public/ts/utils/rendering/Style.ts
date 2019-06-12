
export class Style {

    public readonly fillColor?: string;
    public readonly borderColor?: string;

    public readonly borderSize?: number;

    public constructor(fillColor?: string, borderColor?: string, borderSize?: number) {
        this.fillColor = fillColor;
        this.borderColor = borderColor;
        this.borderSize = borderSize;
    }

    public fill(): boolean {
        return (this.fillColor != undefined);
    }

    public stroke(): boolean {
        return (this.borderColor != undefined && this.borderSize > 0);
    }

}
