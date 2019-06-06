import "jest";

import {SHIFT_KEY,
        IO_PORT_LENGTH,
        IO_PORT_RADIUS,
        DEFAULT_SIZE,
        LEFT_MOUSE_BUTTON,
        ROTATION_CIRCLE_RADIUS} from "../../../../../site/public/ts/utils/Constants";
import {IOObject} from "../../../../../site/public/ts/models/ioobjects/IOObject";
import {Tool} from "../../../../../site/public/ts/utils/tools/Tool";
import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {Input} from "../../../../../site/public/ts/utils/Input";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";
import {WiringTool} from "../../../../../site/public/ts/utils/tools/WiringTool";
import {RotateTool} from "../../../../../site/public/ts/utils/tools/RotateTool";
import {TranslateTool} from "../../../../../site/public/ts/utils/tools/TranslateTool";
import {SelectionTool} from "../../../../../site/public/ts/utils/tools/SelectionTool";
import {PanTool} from "../../../../../site/public/ts/utils/tools/PanTool";
import {Wire} from "../../../../../site/public/ts/models/ioobjects/Wire";
import {Port} from "../../../../../site/public/ts/models/ioobjects/Port";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED} from "../../../../../site/public/ts/models/ioobjects/outputs/LED";
import {Vector, V} from "../../../../../site/public/ts/utils/math/Vector";



const camera = new Camera(500, 500);

const center = camera.getCenter();
const CX: number = center.x;
const CY: number = center.y;


function setupInput(toolManager: ToolManager): any {
    // Declare as type: any so that we can manipulate
    //  private methods to simulate user input
    let input: any = new Input(<any>{
        addEventListener:() => {},
        getBoundingClientRect:() => {return {left: 0, top: 0}}
    }, -1);

    input.addListener("keydown", (b?: number) => { toolManager.onKeyDown(input, b); });
    input.addListener("keyup",   (b?: number) => { toolManager.onKeyUp(input, b); });
    input.addListener("mousedown", (b?: number) => { toolManager.onMouseDown(input, b); });
    input.addListener("mousemove", () => { toolManager.onMouseMove(input); });
    input.addListener("mousedrag", (b?: number) => { toolManager.onMouseDrag(input, b); });
    input.addListener("mouseup",   (b?: number) => { toolManager.onMouseUp(input, b); });
    input.addListener("click",     (b?: number) => { toolManager.onClick(input, b); });

    return input;
}

function down(input: any, x: number | Vector, y ?: number): void {
    if (!(x instanceof Vector))  {
        input.onMouseDown(V(x + CX, y + CY));
    }
    else {
        input.onMouseDown(V(x.x + CX, x.y + CY));
    }
}

function up(input: any, x: number | Vector, y ?: number): void {
    if (!(x instanceof Vector))  {
        input.onMouseUp(V(x + CX, y + CY));
    }
    else {
        input.onMouseUp(V(x.x + CX, x.y + CY));
    }
}

function move(input: any, x: number | Vector, y ?: number): void {
    if (!(x instanceof Vector))  {
        input.onMouseMove(V(x + CX, y + CY));
    }
    else {
        input.onMouseMove(V(x.x + CX, x.y + CY));
    }
}

function click(input: any, x: number | Vector, y ?: number): void {
    if (!(x instanceof Vector))  {
        down(input, x, y);
        up(input, x, y);
        input.onClick(V(x + CX, y + CY));
    }
    else {
        down(input, x);
        up(input, x);
        input.onClick(V(x.x + CX, x.y + CY));
    }
}

function dragFromTo(input: any, start: Vector, end: Vector): void {
    down(input, start);
    move(input, end);
    up(input, end);
}

//start of tests

describe("Tool Manager", () => {
    describe("Test 1", () => {
        let designer = new CircuitDesigner(0);
        let toolManager = new ToolManager(camera, designer);

        let s = new Switch();
        let l = new LED();

        designer.addObjects([s, l]);

        const input = setupInput(toolManager);

        s.setPos(V(0, 0)); //set switch at 0 units to the left of switch
        l.setPos(V(200, 0)); //set LED 200 pixels to the right of the switch

        function selections(): Array<IOObject> {
            return toolManager.getSelectionTool().getSelections();
        }

        function tool(): Tool {
            return toolManager.getCurrentTool();
        }

        let lPortPos: Vector = l.getInputPort(0).getWorldTargetPos();
        let sPortPos: Vector = s.getOutputPort(0).getWorldTargetPos();

        it("Click switch, wire switch/led, select entire & rotate", () => {
          click(input, 0,0);
          expect(tool()).not.toBeInstanceOf(WiringTool);
          click(input, lPortPos);
          expect(tool()).toBeInstanceOf(WiringTool);
          expect(designer.getWires()).toHaveLength(0);
          click(input, sPortPos);
          expect(tool()).not.toBeInstanceOf(WiringTool);
          expect(designer.getWires()).toHaveLength(1);
          dragFromTo(input, V(-100, -100), V(300, 300)); // Arbitrary drag box size
          expect(tool()).toBeInstanceOf(SelectionTool);
          expect(selections()).toHaveLength(2);
          let midpoint = toolManager.getSelectionTool().calculateMidpoint();
          let ang1 = l.getAngle();
          move(input, midpoint.x - ROTATION_CIRCLE_RADIUS, midpoint.y);
          down(input, midpoint.x - ROTATION_CIRCLE_RADIUS, midpoint.y);
          move(input, midpoint.x, midpoint.y + ROTATION_CIRCLE_RADIUS); // Flip selection
          up(input, midpoint.x, midpoint.y + ROTATION_CIRCLE_RADIUS);
          let ang2 = l.getAngle();
          expect(ang1).not.toEqual(ang2);

        });
    });
    describe ("Test 2", () => {
        let designer = new CircuitDesigner(0);
        let toolManager = new ToolManager(camera, designer);

        let s = new Switch();
        let l = new LED();
        let s1 = new Switch();
        let a = new ANDGate();
        designer.addObjects([s, s1, l, a]);
        s.setPos(V(-200, -50));
        l.setPos(V(200, 0));
        s1.setPos(V(-200, 50));
        a.setPos(V(0, 0));

        const input = setupInput(toolManager);

        function selections(): Array<IOObject> {
            return toolManager.getSelectionTool().getSelections();
        }

        function tool(): Tool {
            return toolManager.getCurrentTool();
        }

        let lPortPos: Vector = l.getInputPort(0).getWorldTargetPos();
        let sPortPos: Vector = s.getOutputPort(0).getWorldTargetPos();





        sPortPos = s.getOutputPort(0).getWorldTargetPos();
        lPortPos = l.getInputPort(0).getWorldTargetPos();
        let s1PortPos: Vector = s1.getOutputPort(0).getWorldTargetPos();
        let aOutPos: Vector = a.getOutputPort(0).getWorldTargetPos();
        let aIn1Pos: Vector = a.getInputPort(0).getWorldTargetPos();
        let aIn2Pos: Vector = a.getInputPort(1).getWorldTargetPos();

        it("Beginning of second set of tests", () => {

            expect(designer.getObjects()).toHaveLength(4);

        });

        it("Connect s to and gate input", () => {

            click(input, sPortPos);
            expect(tool()).toBeInstanceOf(WiringTool);
            click(input, aIn1Pos);
            expect(tool()).not.toBeInstanceOf(WiringTool);
            expect(designer.getWires()).toHaveLength(1);

        });

        it("Connect s1 to other and gate input", () => {
            click(input, s1PortPos);
            expect(tool()).toBeInstanceOf(WiringTool);
            click(input, aIn2Pos);
            expect(tool()).not.toBeInstanceOf(WiringTool);
            expect(designer.getWires()).toHaveLength(2);
        });

        it ("Connect led to and gate output", () => {
            click(input, lPortPos);
            expect(tool()).toBeInstanceOf(WiringTool);
            click(input, aOutPos);
            expect(tool()).not.toBeInstanceOf(WiringTool);
            expect(designer.getWires()).toHaveLength(3);
        });

        it ("Turn on switches", () => {
            click(input, s.getPos());
            expect(s.isOn());
            expect(tool()).toBeInstanceOf(SelectionTool);
            click(input, s1.getPos());
            expect(s1.isOn());
            expect(tool()).toBeInstanceOf(SelectionTool);
            expect(l.isOn());
        });
    });
});
