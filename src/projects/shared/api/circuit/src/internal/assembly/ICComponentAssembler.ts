import {Vector} from "Vector";
import {AssemblerParams, AssemblyReason} from "./Assembler";
import {PortFactory} from "./PortAssembler";
import {ComponentAssembler} from "./ComponentAssembler";


export class ICComponentAssembler extends ComponentAssembler {
    public constructor(params: AssemblerParams, size: Vector, factory: PortFactory) {
        super(params, size, factory, [{
            kind: "BaseShape",

            dependencies: new Set([AssemblyReason.TransformChanged]),
            assemble: (comp) => ({
                kind:      "Rectangle",
                transform: this.getTransform(comp),
            }),

            styleChangesWhenSelected: true,
            getStyle: (comp) => this.options.fillStyle(this.isSelected(comp.id)),
        }])
    }
}




// export class ICComponentAssembler extends Assembler<Schema.Component> {
//     protected readonly icID: GUID;
//     protected portAssembler: PortAssembler;

//     public constructor(params: AssemblerParams, icID: GUID) {
//         super(params);

//         this.icID = icID;

//         // this.portAssembler = new PortAssembler(params, factory);
//     }

//     protected getPortPos(group: string, index: number): PartialPortPos {
//         const pos = this.circuit.getICPortPos(this.icID, group, index).unwrap();
//         const size = this.getSize();
//         return {
//             origin: pos,

//             dir: Math.abs(pos.x)-size.x/2 < Math.abs(pos.y)-size.y/2
//                 ? V(0, -1).scale(pos.y).normalize()
//                 : V(-1, 0).scale(pos.x).normalize(),
//         }
//     }

//     protected getPortFactory(): PortFactory {
//         // TODO: Make this better
//         return this.circuit.getComponentInfo(`IC/${this.icID}`)
//             .map((c) => MapObj(c.defaultPortConfig, ([group, _total]) =>
//                 (index: number, _total: number) => this.getPortPos(group, index)))
//             .unwrap();
//     }

//     protected getPos(comp: Schema.Component): Vector {
//         return V(comp.props.x ?? 0, comp.props.y ?? 0);
//     }

//     protected getAngle(comp: Schema.Component): number {
//         return comp.props.angle ?? 0;
//     }

//     protected getSize(): Vector {
//         return this.circuit.getICSize(this.icID).unwrap();
//     }

//     protected getTransform(comp: Schema.Component) {
//         return this.cache.componentTransforms.get(comp.id)!;
//     }

//     public override assemble(ic: Schema.Component, reasons: Set<AssemblyReason>) {
//         if (ic.kind !== `IC/${this.icID}`) {
//             throw new Error(`Attempted to assemble component with kind ${ic.kind}`+
//                 ` which isn't for this IC assembler! (${this.icID})`)
//         }

//         const added            = reasons.has(AssemblyReason.Added);
//         const transformChanged = reasons.has(AssemblyReason.TransformChanged);
//         // const selectionChanged = reasons.has(AssemblyReason.SelectionChanged);

//         if (added || transformChanged) {
//             this.cache.componentTransforms.set(ic.id, new Transform(
//                 this.getPos(ic),
//                 this.getSize(),
//                 this.getAngle(ic),
//             ));

//             this.portAssembler = new PortAssembler(
//                 { cache: this.cache, circuit: this.circuit, options: this.options },
//                 this.getPortFactory(),
//             );
//         }
//         this.portAssembler.assemble(ic, reasons);

//         // NOTE: THIS SYSTEM ASSUMES THAT THE PRIM ASSEMBLY ORDER IS FIXED
//         // USE GROUP PRIMS IF YOU NEED AN 'N' AMOUNT OF PRIMS.

//         // If added, completely assemble.
//         if (added) {
//             this.cache.componentPrims.set(ic.id, [{
//                 kind: "Rectangle",

//                 transform: this.getTransform(ic),

//                 style: this.options.fillStyle(this.isSelected(ic.id)),
//             }]);
//         }

//         // // TODO udpate style
//     }
// }
