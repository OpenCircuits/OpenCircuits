// import {serializable} from "serialeazy";

// import {V} from "Vector";

// import {InputPort} from "../InputPort";
// import {Positioner} from "core/models/ports/positioners/Positioner";
// import {Ports} from "digital/models/ioobjects/flipflops/DFlipFlop";
// import {IO_PORT_LENGTH} from "core/utils/Constants";

// @serializable("DFlipFlopPositioner")
// export class DFlipFlopPositioner extends Positioner<InputPort> {

//     /**
//      * Port positioning for D Flip Flop.
//      *  It sets the Set and Reset on top and bottom
//      *
//      * @param arr The array of input ports
//      */
//     public updatePortPositions(ports: Array<InputPort>): void {
//         super.updatePortPositions([ports[Ports.C], ports[Ports.D]]);

//         const height = ports[0].getParent().getSize().y;

//         {
//             const PRE = ports[Ports.PRE];
//             PRE.setOriginPos(V(0, height/2));
//             PRE.setTargetPos(V(0, height/2 + IO_PORT_LENGTH/2));
//         }
//         {
//             const CLR = ports[Ports.CLR];
//             CLR.setOriginPos(V(0, -height/2));
//             CLR.setTargetPos(V(0, -height/2 - IO_PORT_LENGTH/2));
//         }
//     }

// }
