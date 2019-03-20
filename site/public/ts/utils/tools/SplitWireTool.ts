import {LEFT_MOUSE_BUTTON,
        OPTION_KEY,
        SHIFT_KEY} from "../Constants";
import {Tool} from "./Tool";
import {TranslateTool} from "./TranslateTool"
import {SelectionTool} from "./SelectionTool";
import {CircuitDesigner} from "../../models/CircuitDesigner";
import {Wire} from "../../models/ioobjects/Wire";
import {WirePort} from "../../models/ioobjects/WirePort";
import {Vector,V} from "../math/Vector";
import {BezierContains} from "../math/MathUtils";
import {Input} from "../Input";
import {Camera} from "../Camera";

export class SplitWireTool extends TranslateTool {

    private designer: CircuitDesigner;
    private wire1: Wire;
    private wire2: Wire;
    private wirePort: WirePort;

    public constructor(designer: CircuitDesigner, camera: Camera) {
        super(camera);
        this.designer = designer;
    }

    public activate(currentTool: Tool, event: string, input: Input, button?: number): boolean {
        if (!(currentTool instanceof SelectionTool))
            return false;
        if (!(event == "mousedrag"))
            return false;

            console.log(currentTool);
            console.log("ASd");

        //go through every wire and check to see if it has been selected
        let wire_selected = false;
        let currentWire;
        let worldMousePos = this.camera.getWorldPos(input.getMousePos());
        for(let w of this.designer.getWires()){
            if(BezierContains(w.getShape(), worldMousePos)){
                currentWire = w;
                wire_selected = true;
                break;
            }
        }

        if(!wire_selected){
            return false;
        }

        currentTool.clearSelections();

        //create new wire port
        this.wirePort = new WirePort();
        this.wirePort.setPos(worldMousePos);
        this.designer.addObject(this.wirePort);

        currentTool.setCurrentlyPressedObj(this.wirePort);
        currentTool.addSelection(this.wirePort);

        //store old wire's values and delete it
        let currentInput = currentWire.getInput();
        let currentOutput = currentWire.getOutput();
        this.designer.removeWire(currentWire);

        // Create two new wires
        this.wire1 = this.designer.createWire(currentInput, this.wirePort.getInputPort(0));
        this.wire2 = this.designer.createWire(this.wirePort.getOutputPort(0), currentOutput);

        //set control points
        //c1 corresponds with point 1 and c2 corresponds with point 2
        let w1c1 = new Vector(currentInput.getWorldTargetPos().x, this.wirePort.getPos().y);
        this.wire1.getShape().setC1(w1c1);
        let w1c2 = new Vector(this.wirePort.getPos().x, currentInput.getWorldTargetPos().y);
        this.wire1.getShape().setC1(w1c2);

        let w2c1 = new Vector(this.wirePort.getPos().x, currentOutput.getWorldTargetPos().y);
        this.wire1.getShape().setC1(w2c1);
        let w2c2 = new Vector(currentInput.getWorldTargetPos().x, this.wirePort.getPos().y);
        this.wire1.getShape().setC1(w2c2);

        return super.activate(currentTool, event, input, button);
    }
}
