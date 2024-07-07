

export abstract class CircuitView {
    private readonly designer: CircuitDesigner;
    private readonly toolManager: ToolManager;
    private readonly toolConfig: ToolConfig;

    public readonly options: RenderOptions;

    public readonly scheduler: RenderScheduler;
    public readonly renderer: RenderHelper;

    private cleanupFunc: (() => void) | undefined;

    // SoT for the camera, since it's tied to the view
    public camera: Schema.Camera;
    public cameraMat: Matrix2x3;

    public constructor(designer: CircuitDesigner, toolManager: ToolManager, toolConfig: ToolConfig) {
        this.designer = designer;
        this.toolManager = toolManager;
        this.toolConfig = toolConfig;

        this.options = new DefaultRenderOptions();

        this.scheduler = new RenderScheduler();
        this.renderer = new RenderHelper();
        this.camera = {
            x:    0,
            y:    0,
            zoom: 0.02,
        };
        this.cameraMat = this.calcCameraMat();

        this.scheduler.subscribe(() => this.render());
        this.scheduler.setBlocked(true);
    }

    protected calcCameraMat() {
        const { x, y, zoom } = this.camera;

        return new Matrix2x3(V(x, y), 0, V(zoom, -zoom));
    }

    public toWorldPos(pos: Vector): Vector {
        return this.cameraMat.mul(pos.sub(this.renderer.size.scale(0.5)));
    }
    public toScreenPos(pos: Vector): Vector {
        return this.cameraMat.inverse().mul(pos).add(this.renderer.size.scale(0.5));
    }
    public resize(w: number, h: number) {
        // Request a render on resize
        this.scheduler.requestRender();
    }

    public attachCanvas(canvas: HTMLCanvasElement): CleanupFunc {
        const renderers = (this.toolConfig.renderers ?? []);

        // Setup input adapter
        const inputAdapter = new InputAdapter(canvas, this.designer.circuit.camera);

        // Setup tool manager
        inputAdapter.subscribe((ev) => this.toolManager.onEvent(ev, this.designer));

        // // Attach tool renderers
        // const renderCleanup = this.designer.circuit.addRenderCallback((renderArgs) =>
        //     renderers.forEach((toolRenderer) => toolRenderer.render({
        //         circuit: this.designer.circuit,
        //         curTool: this.toolManager.curTool,
        //         input:   inputAdapter.state,
        //         ...renderArgs,
        //     })));

        this.renderer.setCanvas(canvas);

        this.cleanupFunc = () => {
            renderCleanup();
            inputAdapter.cleanup();
        };

        // Unblock scheduler once a canvas is set
        this.scheduler.setBlocked(false);

        return () => this.detachCanvas();
    }

    public detachCanvas(): void {
        this.designer.circuit.detachCanvas();
        this.cleanupFunc?.();

        this.cleanupFunc = undefined;
    }

    // public setView(kind: "main"): void;
    // public setView(kind: "ic", id: string, type: "internal" | "display"): void;
    public setView(kind: "main" | "ic", id?: string, type?: "internal" | "display"): void {
        if (kind === "main") {
            return;
        } else {
            return;
        }
    }

    public setCameraProps(props: Partial<Schema.Camera>) {
        const dx = (props.x ?? this.camera.x) - this.camera.x;
        const dy = (props.y ?? this.camera.y) - this.camera.y;
        const dz = (props.zoom ?? this.camera.zoom) - this.camera.zoom;

        // No change, no need to emit event
        if (dx === 0 && dy === 0 && dz === 0)
            return;

        this.camera.x = (props.x ?? this.camera.x);
        this.camera.y = (props.y ?? this.camera.y);
        this.camera.zoom = (props.zoom ?? this.camera.zoom);

        // Update camera matrix and request re-render
        this.cameraMat = this.calcCameraMat();
        this.scheduler.requestRender();

        this.publish("oncamerachange", { dx, dy, dz });
    }

    public getCamera(): Readonly<Schema.Camera> {
        return this.camera;
    }

    protected render(): void {
        if (!this.renderer.canvas)
            throw new Error("CircuitView: Attempted Circuit render before a canvas was set!");

        this.updateDirtyObjs();

        // Clear canvas
        this.renderer.clear();

        this.renderer.save();

        // Transform to world-space
        this.renderer.toWorldSpace(this.cameraMat);

        // Render grid
        if (this.options.showGrid)
            RenderGrid(this);

        // Render wires
        // TODO[model_refactor](leon) - render by depth
        this.wirePrims.forEach((prims) => {
            prims.forEach((prim) => {
                // if (!prim.cull(this.circuit.getCamera()))
                //     return;
                this.renderer.draw(prim);
            });
        });

        // Render components
        // TODO[model_refactor](leon) - render by depth
        this.componentPrims.forEach((prims, compID) => {
            // Draw ports first
            this.portPrims.get(compID)?.forEach((prim) => {
                // if (!prim.cull(this.circuit.getCamera()))
                //     return;
                this.renderer.draw(prim);
            });

            // Draw prims for component
            prims.forEach((prim) => {
                // if (!prim.cull(this.circuit.getCamera()))
                //     return;
                this.renderer.draw(prim);
            });
        });

        // Debug rendering

        // Callback for post-rendering
        this.publish("onrender", { renderer: this.renderer });
        this.renderer.restore();
    }
}
