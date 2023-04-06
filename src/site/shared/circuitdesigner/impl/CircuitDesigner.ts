import {Circuit, Obj}    from "core/public";
import {DefaultTool}     from "shared/tools/DefaultTool";
import {Tool}            from "shared/tools/Tool";
import {Cursor}          from "shared/utils/input/Cursor";
import {InputAdapter}    from "shared/utils/input/InputAdapter";
import {CircuitDesigner} from "../CircuitDesigner";
import {ToolManager}     from "./ToolManager";


export class CircuitDesignerImpl<Circ extends Circuit> implements CircuitDesigner<Circ> {
    public readonly circuit: Circ;

    public inputAdapter: InputAdapter;

    private readonly toolManager: ToolManager;

    private readonly state: {
        curPressedObj?: Obj;
        cursor?: Cursor;
    }

    public constructor(
        circuit: Circ,
        { defaultTool, tools }: {
            defaultTool: DefaultTool;
            tools: Tool[];
        },
    ) {
        this.circuit = circuit;

        this.inputAdapter = new InputAdapter();

        this.toolManager = new ToolManager(defaultTool, tools);

        this.state = {
            curPressedObj: undefined,
            cursor:        undefined,
        };

        // Setup input manager to attach to the Circuit's canvas
        if (circuit.canvas)
            this.inputAdapter.setupOn(circuit.canvas);

        circuit.subscribe((ev) => {
            if (ev.type === "attachCanvas")
                this.inputAdapter.setupOn(ev.canvas);
            if (ev.type === "detachCanvas")
                this.inputAdapter.tearDown();
        });

        // Setup tool manager
        this.inputAdapter.subscribe((ev) => this.toolManager.onEvent(ev, this));
    }

    public get curPressedObj() {
        return this.state.curPressedObj;
    }
    public set curPressedObj(obj: Obj | undefined) {
        this.state.curPressedObj = obj;
    }

    public get cursor() {
        return this.state.cursor;
    }
    public set cursor(cursor: Cursor | undefined) {
        this.state.cursor = cursor;
    }
}
