import {serializable, serialize} from "serialeazy";

import {IOObjectSet} from "core/utils/ComponentUtils";

import {IOObject} from "core/models/IOObject";
import {CircuitDesigner} from "core/models/CircuitDesigner";

import {AnalogObjectSet} from "analog/utils/ComponentUtils";

import {AnalogComponent} from "./AnalogComponent";
import {AnalogWire} from "./AnalogWire";
import {AnalogPort} from "./ports/AnalogPort";
import { Battery, Resistor, Capacitor } from "./eeobjects";

@serializable("AnalogCircuitDesigner")
export class AnalogCircuitDesigner extends CircuitDesigner {
    @serialize
    private objects: AnalogComponent[];
    @serialize
    private wires: AnalogWire[];

    private netlist: string[];

    private updateCallback: () => void;

    public constructor(callback: () => void = () => {}) {
        super();

        this.updateCallback = callback;

        this.reset();
    }

    public reset(): void {
        this.objects = [];
        this.wires   = [];
    }

    /**
     * Method to call when you want to force an update
     *     Used when something changed but isn't propagated
     *     (i.e. Clock updated but wasn't connected to anything)
     */
    public forceUpdate(): void {
        this.updateCallback();
    }

    public createWire(p1: AnalogPort, p2: AnalogPort): AnalogWire {
        return new AnalogWire(p1, p2);
    }

    public addGroup(group: IOObjectSet): void {
        for (const c of group.getComponents())
            this.addObject(c as AnalogComponent);

        for (const w of group.getWires())
            this.addWire(w as AnalogWire);
    }

    public addObjects(objects: AnalogComponent[]): void {
        for (const object of objects)
            this.addObject(object);
    }

    public addObject(obj: AnalogComponent): void {
        if (this.objects.includes(obj))
            throw new Error("Attempted to add object that already existed!");

        obj.setDesigner(this);
        this.objects.push(obj);
    }

    public addWire(wire: AnalogWire): void {
        if (this.wires.includes(wire))
            throw new Error("Attempted to add a wire that already existed!");

        wire.setDesigner(this);
        this.wires.push(wire);
    }

    public remove(o: AnalogComponent | AnalogWire): void {
        if (o instanceof AnalogComponent)
            this.removeObject(o);
        else
            this.removeWire(o);
    }

    public removeObject(obj: AnalogComponent): void {
        if (!this.objects.includes(obj))
            throw new Error("Attempted to remove object that doesn't exist!");

        this.objects.splice(this.objects.indexOf(obj), 1);
        obj.setDesigner(undefined);
    }

    public removeWire(wire: AnalogWire): void {
        if (!this.wires.includes(wire))
            throw new Error("Attempted to remove wire that doesn't exist!");

        this.wires.splice(this.wires.indexOf(wire), 1);
        wire.setDesigner(undefined);
    }

    // Shift an object to a certain position
    //  within it's list
    public shift(obj: AnalogComponent | AnalogWire, i?: number): number {
        // Find initial position in list
        const arr: IOObject[] =
                (obj instanceof AnalogComponent) ? (this.objects) : (this.wires);
        const i0 = arr.indexOf(obj);
        if (i0 === -1)
            throw new Error("Can't move object! Object doesn't exist!");

        // Shift object to position
        i = (i == undefined ? arr.length : i);
        arr.splice(i0, 1);
        arr.splice(i, 0, obj);

        // Return initial position
        return i0;
    }

    public getGroup(): AnalogObjectSet {
        return new AnalogObjectSet((<IOObject[]>this.objects).concat(this.wires));
    }

    public getObjects(): AnalogComponent[] {
        return this.objects.slice(); // Shallow copy array
    }

    public getWires(): AnalogWire[] {
        return this.wires.slice(); // Shallow copy array
    }

    public getXMLName(): string {
        return "circuit";
    }


    //Searches through all of the connections of an object, and assigns all those ports an appropiate node value.
    //start is the index of the objects array for the object that this function should start on.
    //NetNodes is a passed-by-reference copy of NetNodes from the giveNetList function. This function will modify the array.
    //In the event that one of the connections is a standalone port, the function will recurse with that port as the start index
    //Always call this function with the ground as the start node first, if it exists.
    //Unless it's the ground, if all nodes of the start component have already been identified, this function immediately returns
    private labelNodes(start: number, NetNodes: { name:string, xpos:number, ypos:number, nvals:number[]}[]): void {
        let nodeVal: number = -1;
        let nodeMin: number = -1;
        let nodeValPos: number = -1;
        let nodeMinPos: number = -1;

        //Stores which indeces in the component's ports array has already been covered
        //nodeTracker[i] corresponds to ports[i]. true means it's analyzed already, false means otherwise
        let nodeTracker: boolean[] = [];

        //Find the smallest node values amongst those that are labelled
        if (NetNodes[start].name != "Ground") {
            let flag: boolean = false;
            for (let i:number = 0; i < NetNodes[start].nvals.length; ++i) {
                nodeTracker.push(false);
                if (NetNodes[start].nvals[i] > -1) {
                    flag = true;
                    if (nodeMin == -1) {
                        nodeMin = NetNodes[start].nvals[i];
                        nodeMinPos = i;
                    }
                    else if (NetNodes[start].nvals[i] < nodeMin){
                        nodeMin = NetNodes[start].nvals[i];
                        nodeMinPos = i;
                    }
                }
                
            }

            if (!flag) {
                return;
            }

            nodeVal = nodeMin;
            nodeValPos = nodeMinPos;

        }
        else {
            nodeMin = 0;
            nodeMinPos = 0;
            nodeVal = 0;
            nodeValPos = 0;
        }

        //If the component is connected to any standalone ports, this keeps track of them for later recursion
        let standalonePorts: number[] = [];

        //If true, the rest of the ports yet to be analyzed are all unlabelled.
        let labelFlag: boolean = false;

        //Starting from the port with the smallest node label, iterate through all of that port's connections
        //If a connection does not already have a label, label it with the same node label as the current port being analyzed
        //i.e. if the ground is connected to a resistor, the algorithm starts on the ground's port with a label of 0.
        //  It would detect the resistor, and label the resistor's connected port with 0.
        //This will also fill in start component's ports with appropriate labels, if they aren't already
        //i.e. if a battery (2 ports) only has one port labelled with 0, the other port would automatically be labelled with 1.
        while (true) {

            //modifiedNodes stores the indeces of any components that became labelled. This is used for potential recursion in the final lines of this function.
            let modifiedNodes: number[] = [];

            for (let i: number = 0; i < this.objects[start].getPorts()[nodeValPos].getWires().length; ++i) {
                let port1Name: string = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP1Component().getName();
                let port1XPos: number = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP1Component().getPos().x;
                let port1YPos: number = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP1Component().getPos().y;
                let port2Name: string = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP2Component().getName();
                let port2XPos: number = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP2Component().getPos().x;
                let port2YPos: number = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP2Component().getPos().y;

                //Retrieves the port number of the connected node
                let port1Num: number = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP1().getIndex();
                let port2Num: number = this.objects[start].getPorts()[nodeValPos].getWires()[i].getP2().getIndex();

                
            

                //If the component isn't a standalone port, finds and labels the appropriate port of the connected component in NetNodes
                //If the component is a standalone port, mark it for later recursion
                for (let k: number = 0; k < NetNodes.length; ++k) {
                    if (NetNodes[k].name == port1Name && port1Name == "Port"
                            && NetNodes[k].xpos == port1XPos && NetNodes[k].ypos == port1YPos && NetNodes[k].nvals[port1Num] == -1) {
                        standalonePorts.push(k);
                        modifiedNodes.push(k);
                        break;
                    }
                    else if (NetNodes[k].name == port1Name && NetNodes[k].xpos == port1XPos && NetNodes[k].ypos == port1YPos
                             && NetNodes[k].nvals[port1Num] == -1) {
                        NetNodes[k].nvals[port1Num] = nodeVal;
                        modifiedNodes.push(k);
                        break;
                    }

                    if (NetNodes[k].name == port2Name && port2Name == "Port"
                         && NetNodes[k].xpos == port2XPos && NetNodes[k].ypos == port2YPos && NetNodes[k].nvals[port2Num] == -1) {
                        standalonePorts.push(k);
                        modifiedNodes.push(k);
                        break;
                    }
                    else if (NetNodes[k].name == port2Name && NetNodes[k].xpos == port2XPos && NetNodes[k].ypos == port2YPos
                             && NetNodes[k].nvals[port2Num] == -1) {
                        NetNodes[k].nvals[port2Num] = nodeVal;
                        modifiedNodes.push(k);
                        break;
                    }

                }
            }
            
            if (standalonePorts.length > 0) {
                for (let i: number = 0; i < standalonePorts.length; ++i) {
                    NetNodes[standalonePorts[i]].nvals[0] = nodeVal;
                    this.labelNodes(standalonePorts[i], NetNodes);
                }
            }

            //Decide which node of the current component to analyze next.
            //First, it goes in increasing order of nodes that have already been labelled.
            //Then, it goes in order of how they're stored in currentPorts[], properly given them labels
            nodeTracker[nodeValPos] = true;
            let flag2: boolean = false;
            let finishedFlag: boolean = true;
            if (!labelFlag) {
                for (let i: number = 0; i < NetNodes[start].nvals.length; ++i) {                    
                    if (NetNodes[start].nvals[i] != -1 && NetNodes[start].nvals[i] < nodeMin && !nodeTracker[i]){
                        flag2 = true;
                        nodeMin = NetNodes[start].nvals[i];
                        nodeMinPos = i;
                    }
                }

                //If nodeMin was updated with a new value, make that the new nodeVal
                if (flag2) {
                    nodeVal = nodeMin;
                    nodeValPos = nodeMinPos;
                    finishedFlag = false;
                }
            }
            //Otherwise, find the first un-labelled port. Label it, assign it to nodeVal
            if (!flag2 || labelFlag) {
                for (let i: number = 0; i < NetNodes[start].nvals.length; ++i) {   
                    if (NetNodes[start].nvals[i] == -1 && !nodeTracker[i]) {
                        nodeVal += 1;
                        nodeValPos = i;
                        NetNodes[start].nvals[i] = nodeVal;
                        finishedFlag = false;
                        break;                        
                    }
                }
            }

            //If no more ports can be analyzed, break off the infinite loop
            //If the function hasn't already recursed into standalone ports, recurse into a modified component if it still has unlabelled nodes. 
            //      OR a modified component is connected to another component with unlabelled nodes
            //i.e. After the battery, it may recurse into a capacitor that is connected to the battery.
            //This ensures proper ordering of the nodes.
            if (finishedFlag) {
                if (standalonePorts.length == 0) {
                    for (let i: number = 0; i < modifiedNodes.length; ++i) {
                        for (let k: number = 0; k < NetNodes[modifiedNodes[i]].nvals.length; ++k) {
                            if (NetNodes[modifiedNodes[i]].nvals[k] == -1) {
                                this.labelNodes(modifiedNodes[i], NetNodes);
                            }
                        }
                        
                    }

                    //A final check to ensure all nodes in all components have been labelled.
                    //If not, recurses into each component referenced by modifiedNodes as a last-ditch, semi-brute force method. Causes the worst-case runtime
                    //This allows the user to connect components without using standalone ports (refer to the test cases)
                    for (let i: number = 0; i < NetNodes.length; ++i) {
                        for (let k: number = 0; k < NetNodes[i].nvals.length; ++k) {
                            if (NetNodes[i].nvals[k] == -1) {
                                for (let j: number = 0; j < modifiedNodes.length; ++j) {
                                    this.labelNodes(modifiedNodes[j], NetNodes);
                                }
                                
                            }
                        }
                    }

                }

                break;
            }
       }


    }

    //Returns a string listing all the node values with an entry of NetNodes.
    //Input the index of the NetNodes array, and the NetNodes array itself.
    //Note that the string will not end with a " " character
    private nodeString(nvals:number[]): string {
        let result: string = "";
        for (let i: number = 0; i < nvals.length; ++i) {
            if (i < nvals.length - 1) {
                result += nvals[i] + " ";
            }
            else {
                result += nvals[i];
            }
            
        }

        return result;
    }

    //Converts the information stored in object[] and NetNodes[] to create the netlist string
    //The nvals[] array within NetNodes[] must be initialized with the labelNodes() before calling this function, otherwise every component will be connected to node -1
    //The order of components in the netlist may not be desirable, as it relies on the order of the objects array. 
    //  However, this order does not functionally change the netlist. It just may not be incredibly organized

    //When adding a new component to the netlist parser, do the following:
    // - Add a new counter variable for the naming convention
    // - Add an elseiif statement to all the others in the for loop. 
    //      You should (hopefully) be fine if you copy-paste a pre-existing else-if statement. Just triple-check that all variables were changed appropriately!
    private stringifyNetList(NetNodes: { name:string, xpos:number, ypos:number, nvals:number[]}[]): string {
        //First line is always the title of the netlist
        let result: string = "OpenCircuits Outputted Netlist\n";

        //----------------------------------------------------------------
        //This line is required for the program NetlistViewer for testing. 
        //If you're not running test cases, leave this line commented out
        //----------------------------------------------------------------
        //result += ".SUBCKT OpenCircuits\n";

        //A bunch of counter variables for each component. Used to properly name each on in the netlist.
        let batteryCount: number = 1;
        let resistorCount: number = 1;
        let capacitorCount: number = 1;

        //Iterate through the objects array. The line format is different for each possible component.
        //Note that the ground component is not explicitly defined in the netlist. It is instead represented as the node value 0.
        //  If a port has node value 0, it is connected to a ground.
        for (let i: number = 0; i < this.objects.length; ++i) {
            //Voltage battery
            //Example: v1 1 0 dc 10
            if (this.objects[i].getName() == "Battery") {
                //Needs to be cast to the Battery object in order to use the getVoltage() function
                let temp: Battery = this.objects[i] as Battery;

                //Special case: As the order of the node values printed matters for a battery, the nvals array inputted into nodeString must be reversed
                let tempNVals: number[] = [NetNodes[i].nvals[1], NetNodes[i].nvals[0]];
                
                result += "v" + batteryCount + " " + this.nodeString(tempNVals) + " dc " + temp.getVoltage() + "\n";
                ++batteryCount;
            }

            //Resistor
            //Example: r1 2 0 3.3k
            //The resistance value stored in the Resistor class is assumed to be in kilo-ohms
            else if(this.objects[i].getName() == "Resistor") {
                let temp: Resistor = this.objects[i] as Resistor;
                result += "r" + resistorCount + " " + this.nodeString(NetNodes[i].nvals) + " " + temp.getResistance() + "k\n";
                ++resistorCount;
            }

            //Capacitor
            //Example: c1 1 2 47u ic=0
            //The capacitance value stored in the Capacitor class is assumed to be in micro-farads
            //The last argument is an optional value for initial voltage in the capacitor.
            //  This value has not yet been implemented. By default, ic = 0.
            else if(this.objects[i].getName() == "Capacitor") {
                let temp: Capacitor = this.objects[i] as Capacitor;
                result += "c" + capacitorCount + " " + this.nodeString(NetNodes[i].nvals) + " " + temp.getCapacitance() + "u ic=0\n";
                ++capacitorCount;
            }
        }

        //----------------------------------------------------------------
        //This line is required for the program NetlistViewer for testing.
        //If you're not running test cases, leave this line commented out  
        //----------------------------------------------------------------
        //result += ".ENDS OpenCircuits\n"; 

        //Note that the final end does not end with a newline character. This is intentional, and a quirk of how netlists are required to work.
        result += ".end";


        return result;
    }

    //Converts the circuit diagram to a netlist that can then be thrown into NGSpice
    //IMPORTANT NOTE: Node 0 MUST be the ground
    public giveNetList(): string {
        //Stores information on what node values should be assigned to each port of a component
        //name is a component's name
        //xpos and ypos are the values stored in cullTransform.pos
        //nvals stores the node value to be used for the generated netlist.
        //nvals[i] corresponds to the port at ports.currentPorts[i]
        //NetNodes[i] corresponds to objects[i]
        let NetNodes: { name:string, xpos:number, ypos:number, nvals:number[]}[] = [];


        //Iterate through the objects[] array, add name and pos to the NetNodes array.
        //nvals will be initialized with [-1, -1] for now
        //The only exception is if there's a ground; the first ground that's found will be given an nval of 0.
        //If no ground exists, the first connection of the first battery found is instead given the nval of 0.
        let groundIndex:number = -1;
        let batteryIndex:number = -1;
        for (let i:number = 0; i < this.objects.length; ++i) {

            NetNodes.push( { "name": this.objects[i].getDisplayName(), "xpos": this.objects[i].getPos().x, "ypos": this.objects[i].getPos().y, "nvals": [-1]} );
            if (NetNodes[i].name == "Ground" && groundIndex == -1) {
                groundIndex = i;
            }
            if (NetNodes[i].name == "Battery" && batteryIndex == -1) {
                batteryIndex = i;
            }

            //Make sure nvals as the correct number of values according to the number of ports with the component
            if (this.objects[i].getPorts().length > 1) {
                for (let k:number = 1; k < this.objects[i].getPorts().length; ++k) {
                    NetNodes[i].nvals.push(-1);
                }
            }

        }
        if (groundIndex > -1) {
            NetNodes[groundIndex].nvals[0] = 0;
        }
        else if (batteryIndex > -1) {
            NetNodes[batteryIndex].nvals[0] = 0;
        }

        
        //objects[0].ports.currentPorts[0].connections[0].p2.parent.name
        //AKA the component pointed to by the first connection of the first port of objects[0]
        //console.log("The tested component is: " + this.objects[0].getPorts()[0].getWires()[0].getP2Component().getName());

        //console.log("The tested component's linked port is: " + this.objects[0].getPorts()[0].getWires()[0].getP2().getIndex());

        //Calls labelNodes, with the index of the ground or the first battery found as the initial starting index.
        //See the comments above this function for more info.
        if (groundIndex > -1) {
            this.labelNodes(groundIndex, NetNodes);
        }
        else if (batteryIndex > -1) {
            this.labelNodes(batteryIndex, NetNodes);
        }
        else {
            this.labelNodes(0, NetNodes);
        }


        let s: string = this.stringifyNetList(NetNodes);
        return s;
    }

    private updateNetList(): void {
        this.netlist = [];
        let temp: string = this.giveNetList();
        this.netlist = temp.split("\n");

        //this.netlist.push("test array");
        //this.netlist.push("V1 1 0 1");
        //this.netlist.push("R1 1 2 1");
        //this.netlist.push("C1 2 0 1 ic=0");
        //this.netlist.push(".tran 10u 3 uic");
        //this.netlist.push(".end");
        console.log("netlist updated");
    }

    public startSimulation(): void {
        this.updateNetList();
        
    }

    public getNetList(): string[] {
        return this.netlist;
    }

}
