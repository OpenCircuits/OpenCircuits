import {Circuit, Obj}    from "core/public";
import {DefaultTool}     from "shared/tools/DefaultTool";
import {ToolRenderer}    from "shared/tools/renderers/ToolRenderer";
import {Tool}            from "shared/tools/Tool";
import {Cursor}          from "shared/utils/input/Cursor";
import {InputAdapter}    from "shared/utils/input/InputAdapter";
import {CircuitDesigner} from "../CircuitDesigner";
import {ToolManager}     from "./ToolManager";


export interface ToolConfig {
    defaultTool: DefaultTool;
    tools: Tool[];
    renderers?: Array<ToolRenderer<Tool | undefined>>;
}

export class CircuitDesignerImpl<CircuitT extends Circuit> implements CircuitDesigner<CircuitT> {
    public readonly circuit: CircuitT;

    private readonly toolManager: ToolManager;
    private readonly toolConfig: ToolConfig;

    private readonly state: {
        curPressedObj?: Obj;
        cursor?: Cursor;
    }

    public constructor(
        circuit: CircuitT,
        config: ToolConfig,
    ) {
        this.circuit = circuit;

        this.toolManager = new ToolManager(config.defaultTool, config.tools);
        this.toolConfig = config;

        this.state = {
            curPressedObj: undefined,
            cursor:        undefined,
        };
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

    public attachCanvas(canvas: HTMLCanvasElement): () => void {
        const { renderers } = this.toolConfig;

        // Setup input adapter
        const inputAdapter = new InputAdapter(canvas, this.circuit.camera);

        // Setup tool manager
        inputAdapter.subscribe((ev) => this.toolManager.onEvent(ev, this));

        // Attach tool renderers
        let renderCleanup = () => {};
        if (renderers) {
            renderCleanup = this.circuit.addRenderCallback(({ renderer, options, circuit }) => {
                renderers.forEach((toolRenderer) => {
                    const curTool = this.toolManager.curTool;
                    if (toolRenderer.isActive(curTool))
                        toolRenderer.render({ renderer, options, circuit, curTool, input: inputAdapter.state });
                });
            });
        }

        this.circuit.attachCanvas(canvas);
        return () => {
            this.circuit.detachCanvas();
            renderCleanup();
            inputAdapter.cleanup();
        }
    }
}
