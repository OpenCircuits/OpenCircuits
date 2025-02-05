import {ColorToHex, SVGDrawing, blend, parseColor} from "svg2canvas";
import {Style}                                     from "./Style";


export interface RenderOptions {
    showGrid: boolean;

    gridSize: number;
    gridStyle: Style;

    defaultFillColor: string;
    selectedFillColor: string;

    defaultBorderColor: string;
    selectedBorderColor: string;

    defaultBorderWidth: number;
    curveBorderWidth: number;

    defaultPortLength: number;
    defaultPortRadius: number;
    portLineWidth: number;
    portBorderWidth: number;

    ledLightRadius: number;
    ledLightIntensity: number;

    wireThickness: number;
    defaultWireColor: string;

    defaultOnColor: string;
    defaultMetastableColor: string;

    // fillColor(selected: boolean): string;
    // borderColor(selected: boolean): string;

    lineStyle(selected: boolean): Style;
    curveStyle(selected: boolean): Style;
    fillStyle(selected: boolean): Style;

    portStyle(selected: boolean, parentSelected: boolean): { lineStyle: Style, circleStyle: Style };
    wireStyle(selected: boolean, color?: string): Style;
}

export class DefaultRenderOptions implements RenderOptions {
    public showGrid = true;

    public gridSize = 1;
    public gridStyle = { stroke: { color: "#999999", size: 0.02 } };

    public defaultFillColor =  "#ffffff";
    public selectedFillColor = "#1cff3e";

    public defaultBorderColor =  "#000000";
    public selectedBorderColor = "#0d7f1f";

    public defaultBorderWidth = 0.04;
    public curveBorderWidth = 0.042;

    public defaultPortLength = 0.7;
    public defaultPortRadius = 0.14;
    public portLineWidth = 0.04;
    public portBorderWidth = 0.02;

    public ledLightRadius = 1.5;
    public ledLightIntensity = 0.75;

    public wireThickness = 0.14;
    public defaultWireColor = "#ffffff";

    public defaultOnColor = "#3cacf2";
    public defaultMetastableColor = "#cc5e5e";

    private images: Record<string, SVGDrawing>;

    public constructor() {
        this.images = {};
    }

    public addImage(key: string, img: SVGDrawing): void {
        this.images[key] = img;
    }
    public getImage(key: string): SVGDrawing {
        if (!(key in this.images)) {
            throw new Error(`Failed to find image with key ${key}!` +
                            `Loaded images: ${Object.keys(this.images).join(",")}`);
        }
        return this.images[key];
    }

    public lineStyle(selected: boolean) {
        return {
            stroke: {
                color: (selected ? this.selectedBorderColor : this.defaultBorderColor),
                size:  this.defaultBorderWidth,
            },
        };
    }
    public curveStyle(selected: boolean) {
        return {
            stroke: {
                color: (selected ? this.selectedBorderColor : this.defaultBorderColor),
                size:  this.curveBorderWidth,
            },
        };
    }
    public fillStyle(selected: boolean): Style {
        return {
            fill:   (selected ? this.selectedFillColor : this.defaultFillColor),
            stroke: {
                color: (selected ? this.selectedBorderColor : this.defaultBorderColor),
                size:  this.defaultBorderWidth,
            },
        };
    }

    public portStyle(selected: boolean, parentSelected: boolean): { lineStyle: Style, circleStyle: Style } {
        return {
            lineStyle: {
                stroke: {
                    color: ((parentSelected && !selected) ? this.selectedBorderColor : this.defaultBorderColor),
                    size:  this.portLineWidth,
                },
            },
            circleStyle: {
                fill:   ((parentSelected || selected) ? this.selectedFillColor : this.defaultFillColor),
                stroke: {
                    color: ((parentSelected || selected) ? this.selectedBorderColor : this.defaultBorderColor),
                    size:  this.portBorderWidth,
                },
            },
        };
    }
    public wireStyle(selected: boolean, color = this.defaultWireColor): Style {
        // Changes color of wires: when wire is selected it changes to the color
        //  selected blended with constant color SELECTED_FILL_COLOR
        const selectedColor = ColorToHex(blend(
            parseColor(color),
            parseColor(this.selectedFillColor),
            0.2
        ));

        // @TODO move to function for getting color based on being selection/on/off
        // Use getColor so that it can overwritten for use in digital isOn/isOff coloring
        return {
            stroke: {
                color: (selected ? selectedColor : color),
                size:  this.wireThickness,
            },
        };
    }
}
