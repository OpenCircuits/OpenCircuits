import {AnyPort} from "core/models/types";

import {DigitalPort} from "core/models/types/digital";

import {PortView} from "core/views/PortView";

import {DigitalViewInfo} from "./DigitalViewInfo";


export class DigitalPortView extends PortView<DigitalPort, DigitalViewInfo> {
    public override isWireable(): boolean {
        // Output ports always can have new connections
        if (this.obj.group === "outputs") // TODOnow: fix
            return true;
        // Input and select ports can only have new connections if they don't already have any
        const wires = this.circuit.getWiresFor(this.obj);
        return (wires.length === 0);
    }

    public override isWireableWith(p: AnyPort): boolean {
        return (
            // We can wire it with `p` if we are an output port and they are an input/select port
            //  or we are an input/select port and they are an output port
            (this.obj.group === "outputs" && (p.group !== "outputs")) ||  // TODOnow: fix
            (this.obj.group !== "outputs" && (p.group === "outputs"))     // TODOnow: fix
        );
    }
}
