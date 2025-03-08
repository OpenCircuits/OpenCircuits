import {ColorToHex, blend, parseColor} from "svg2canvas";
import {FontStyle, Style, TextAlign, TextBaseline}                         from "./Style";


export interface RenderOptions {
    showGrid: boolean;

    gridSize: number;
    gridStyle: Style;

    defaultPortLength: number;
    defaultPortRadius: number;

    defaultFillColor: string;
    selectedFillColor: string;

    defaultBorderWidth: number;
    defaultBorderColor: string;
    selectedBorderColor: string;

    curveBorderWidth: number;

    portLineWidth: number;
    portBorderWidth: number;

    notPortCircleRadius: number;

    ledLightRadius: number;
    ledLightIntensity: number;

    wireThickness: number;
    defaultWireColor: string;

    defaultOnColor: string;
    defaultMetastableColor: string;

    defaultFont: string;
    defaultFontColor: string;
    defaultTextBaseline: TextBaseline;
    defaultTextAlign: TextAlign;

    // fillColor(selected: boolean): string;
    // borderColor(selected: boolean): string;

    lineStyle(selected: boolean): Style;
    curveStyle(selected: boolean): Style;
    fillStyle(selected: boolean): Style;

    fontStyle(): FontStyle;

    portStyle(selected: boolean, parentSelected: boolean): { lineStyle: Style, circleStyle: Style };
    wireStyle(selected: boolean, color?: string): Style;
}

export class DefaultRenderOptions implements RenderOptions {
    public showGrid = true;

    public gridSize = 1;
    public gridStyle = { stroke: { color: "#999999", size: 0.02 } };

    public defaultPortLength = 0.7;
    public defaultPortRadius = 0.14;

    public defaultFillColor =  "#ffffff";
    public selectedFillColor = "#1cff3e";

    public defaultBorderWidth = 0.04;
    public defaultBorderColor =  "#000000";
    public selectedBorderColor = "#0d7f1f";

    public curveBorderWidth = 0.042;

    public portLineWidth = 0.04;
    public portBorderWidth = 0.02;

    public notPortCircleRadius = 0.1;

    public ledLightRadius = 1.5;
    public ledLightIntensity = 0.75;

    public wireThickness = 0.14;
    public defaultWireColor = "#ffffff";

    public defaultOnColor = "#3cacf2";
    public defaultMetastableColor = "#cc5e5e";

    public defaultFont = "lighter 0.3px arial";
    public defaultFontColor = "#000000";
    public defaultTextBaseline = "middle" as const;
    public defaultTextAlign = "center" as const;

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
                color:   (selected ? this.selectedBorderColor : this.defaultBorderColor),
                size:    this.curveBorderWidth,
                lineCap: "round",
            },
        } as const;
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

    public fontStyle(): FontStyle {
        return {
            font:         this.defaultFont,
            textBaseline: this.defaultTextBaseline,
            textAlign:    this.defaultTextAlign,
            color:        this.defaultFontColor,
        }
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
