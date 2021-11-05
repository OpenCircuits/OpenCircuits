import {Action} from "core/actions/Action";

import {CopyGroupAction} from "core/actions/CopyGroupAction";
import {CircuitDesigner, Component, IOObject} from "core/models";
import {GetAllPorts} from "core/utils/ComponentUtils";
import {InputPort} from "digital/models";

export class DigitalCopyGroupAction extends CopyGroupAction {
	public constructor(designer: CircuitDesigner, initialGroup: IOObject[]) {
		super(designer, initialGroup);
	}

	public execute(): Action { // elephant paste part
		for (const object of this.copy.toList()) {
            // all input ports in copy
            for (let p of GetAllPorts(this.copy.toList().filter(o => o instanceof Component) as Component[]).filter(p => p instanceof InputPort) as InputPort[]) {
                let wires = p.getWires();
                for (let w of wires) {
                    console.log(w.getDisplayName() + ": " + w.getP1Component().getDisplayName() + "->" + w.getP2Component().getDisplayName());
                    console.log(w.getIsOn());
                }
                if (wires.length == 0 || !wires.some(w => w.getIsOn())) {
                    p.activate(false);
                    p.getParent();
                    // p.getParent().activate();
                    // for (p.getParent().getOutputPorts())
                }
            }
        }
		return super.execute();
	}
}