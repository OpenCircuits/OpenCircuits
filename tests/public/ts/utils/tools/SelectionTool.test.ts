import "jest";

import {Tool} from "../../../../../site/public/ts/utils/tools/Tool";
import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {Input} from "../../../../../site/public/ts/utils/Input";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";
import {SelectionTool} from "../../../../../site/public/ts/utils/tools/SelectionTool";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED} from "../../../../../site/public/ts/models/ioobjects/outputs/LED";
import {Vector, V} from "../../../../../site/public/ts/utils/math/Vector";
import {Selectable} from "../../../../../site/public/ts/utils/Selectable";

describe("Selection Tool", () => {
    const camera = new Camera(500, 500);
    const designer = new CircuitDesigner(0);
    const toolManager = new ToolManager(camera, designer);

    const s = new Switch();
    const a = new ANDGate();
    const l = new LED();

    designer.addObjects([s, a, l]);

    designer.connect(s, 0, l, 0);

    // Declare as type: any so that we can manipulate
    //  private methods to simulate user input
    const input: any = new Input(<any>{
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

    const center = camera.getCenter();
    const CX = center.x;
    const CY = center.y;

    s.setPos(V(-200, 0)); //set switch at 200 units to the left of And Gate
    a.setPos(V(0,0)); //set and gate at center of the scene
    l.setPos(V(50, 0)); //set LED 100 pixels to the right of the and gate

    function down(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            input.onMouseDown(V(x + CX, y + CY));
        }
        else {
            input.onMouseDown(V(x.x + CX, x.y + CY));
        }
    }

    function up(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            input.onMouseUp(V(x + CX, y + CY));
        }
        else {
            input.onMouseUp(V(x.x + CX, x.y + CY));
        }
    }

    function move(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            input.onMouseMove(V(x + CX, y + CY));
        }
        else {
            input.onMouseMove(V(x.x + CX, x.y + CY));
        }
    }

    function click(x: number | Vector, y ?: number): void {
        if (!(x instanceof Vector))  {
            down(x, y);
            up(x, y);
            input.onClick(V(x + CX, y + CY));
        }
        else {
            down(x);
            up(x);
            input.onClick(V(x.x + CX, x.y + CY));
        }
    }

    function dragFromTo(start: Vector, end: Vector): void {
        down(start);
        move(end);
        up(end);
    }

    function selections(): Array<Selectable> {
        return toolManager.getSelectionTool().getSelections();
    }

    function tool(): Tool {
        return toolManager.getCurrentTool();
    }

    it ("Click on And Gate", () => {
        click(0, 0);

        expect(tool()).toBeInstanceOf(SelectionTool);
        expect(selections()).toContain(a);
    });

    it ("Drag over And Gate and LED", () => {
        dragFromTo(V(-110, 0), V(110, 20));

        expect(tool()).toBeInstanceOf(SelectionTool);
        expect(selections()).toHaveLength(2);

    });

    it ("Turn on Switch", () => {
        click(-200, 0);

        expect(tool()).toBeInstanceOf(SelectionTool);
        expect(l.isOn()).toEqual(true);
    });

});
