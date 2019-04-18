import "jest";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {Input} from "../../../../../site/public/ts/utils/Input";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";
import {TranslateTool} from "../../../../../site/public/ts/utils/tools/TranslateTool";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {V} from "../../../../../site/public/ts/utils/math/Vector";

describe("Translate Tool", () => {
    let camera = new Camera(500, 500);
    let designer = new CircuitDesigner(0);
    let toolManager = new ToolManager(camera, designer);

    var s = new Switch();

    designer.addObject(s);


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

    let center = camera.getCenter();
    const CX: number = center.x;
    const CY: number = center.y;

    s.setPos(V(0, 0)); //center of scene is (0, 0) for objects

    function down(x: number, y: number): void {
        input.onMouseDown({clientX: CX + x, clientY: CY + y});
    }

    function up(x: number, y: number): void {
        input.onMouseUp({clientX: CY + x, clientY: CY + y});
    }

    function move(x: number, y: number): void {
        input.onMouseMove({clientX: CY + x, clientY: CY + y});
    }


    it ("Move mouse without dragging", () => {
        let init_pos = s.getPos();

        move(-5, 0);
        move(-10, 0);
        move(-15, 0);

        let final_pos = s.getPos();

        expect(final_pos).toEqual(init_pos);

    });

    it ("Click and move mouse not on switch", () => {
        let init_pos = s.getPos();

        down(-60, 0);
        move(-65, 0);
        move(-70, 0);
        move(-75, 0);
        move(-80, 0);
        up(-80, 0);

        let final_pos = s.getPos();

        expect(final_pos).toEqual(init_pos);

    });

    it ("Move switch", () => {
        let init_pos = s.getPos();

        down(0, 0);
        move(-5, 0);
        move(-10, 0);
        move(-15, 0);

        let final_pos = s.getPos();

        expect(final_pos).not.toEqual(init_pos);

    });



});
