import "jest";

import {SHIFT_KEY,
        IO_PORT_LENGTH,
        IO_PORT_RADIUS,
        DEFAULT_SIZE,
        LEFT_MOUSE_BUTTON} from "../../../../../site/public/ts/utils/Constants";
import {IOObject} from "../../../../../site/public/ts/models/ioobjects/IOObject";
import {Tool} from "../../../../../site/public/ts/utils/tools/Tool";
import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {Input} from "../../../../../site/public/ts/utils/Input";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";
import {WiringTool} from "../../../../../site/public/ts/utils/tools/WiringTool";
import {Wire} from "../../../../../site/public/ts/models/ioobjects/Wire";
import {Port} from "../../../../../site/public/ts/models/ioobjects/Port";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED} from "../../../../../site/public/ts/models/ioobjects/outputs/LED";
import {Vector, V} from "../../../../../site/public/ts/utils/math/Vector";

describe("Wiring Tool", () => {
    let camera = new Camera(500, 500);
    let designer = new CircuitDesigner(0);
    let toolManager = new ToolManager(camera, designer);

    let s = new Switch();
    let l = new LED();
    let a = new ANDGate();

    designer.addObjects([s, l, a]);


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

    let center = camera.getCenter();
    const CX: number = center.x;
    const CY: number = center.y;

    s.setPos(V(0, 0)); //set switch at 0 units to the left of And Gate
    l.setPos(V(100, 0)); //set LED 100 pixels to the right of the and gate
    a.setPos(V(-200, 0));


    function down(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            input.onMouseDown({clientX: x + CX, clientY: y + CY});
        }
        else {
            input.onMouseDown({clientX: x.x + CX, clientY: x.y + CY});
        }
    }

    function up(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            input.onMouseUp({clientX: x + CX, clientY: y + CY});
        }
        else {
            input.onMouseUp({clientX: x.x + CX, clientY: x.y + CY});
        }
    }

    function move(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            input.onMouseMove({clientX: x + CX, clientY: y + CY});
        }
        else {
            input.onMouseMove({clientX: x.x + CX, clientY: x.y + CY});
        }
    }

    function click(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            down(x, y);
            up(x, y);
            input.onClick({clientX: x + CX, clientY: y + CY});
        }
        else {
            down(x);
            up(x);
            input.onClick({clientX: x.x + CX, clientY: x.y + CY});
        }
    }

    function dragFromTo(start: Vector, end: Vector): void {
        down(start);
        move(end);
        up(end);
    }

    function tool(): Tool {
        return toolManager.getCurrentTool();
    }

    const lPortPos: Vector = l.getInputPort(0).getWorldTargetPos();
    const sPortPos: Vector = s.getOutputPort(0).getWorldTargetPos();
    const aOutPos: Vector = a.getOutputPort(0).getWorldTargetPos();
    const aIn1Pos: Vector = a.getInputPort(0).getWorldTargetPos();

    it ("Click on Switch", () => {

        click(0, 0);

        expect(tool()).not.toBeInstanceOf(WiringTool);

    });

    it ("Click on LED input port", () => {
        click(lPortPos);

        expect(tool()).toBeInstanceOf(WiringTool);
        let wtool: WiringTool = <WiringTool> tool();
        expect(wtool.getWire().getOutputComponent()).toEqual(l);
        expect(wtool.getWire().getOutput()).toEqual(l.getInputPort(0));
    });

    it ("Click on Switch output port", () => {
        click(0, 0);
        click(sPortPos);

        expect(tool()).toBeInstanceOf(WiringTool);
        let wtool: WiringTool = <WiringTool> tool();
        expect(wtool.getWire().getInputComponent()).toEqual(s);
        expect(wtool.getWire().getInput()).toEqual(s.getOutputPort(0));


    });

    it ("Connect Switch to LED", () => {
        click(lPortPos);

        expect(tool()).not.toBeInstanceOf(WiringTool);
        expect(designer.getWires()).toHaveLength(1);
    });

    it ("Drag from Switch to AND Gate output", () => {
        down(sPortPos);
        move(aOutPos);
        up(aOutPos);

        expect(designer.getWires()).toHaveLength(1);
    });

    it ("Drag from Switch to AND Gate input", () => {
        down(sPortPos);
        move(aIn1Pos);
        up(aIn1Pos);

        expect(designer.getWires()).toHaveLength(2);
    });



});
