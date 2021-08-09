import { DocConnWrapper } from "./ConnectionWrapper";
import { Action, ActionTransformer, OTModel } from "./Interfaces";
import { OTDocument } from "./OTDocument";

// The interface used by external code to interact with the OT model
export class Document<M extends OTModel> {
	private doc: OTDocument<M>;
	private cw: DocConnWrapper<M>;

	public constructor(doc: OTDocument<M>, cw: DocConnWrapper<M>) {
		this.doc = doc;
		this.cw = cw;
	}

	public Propose(action: Action<M>): boolean {
		if (!this.doc.Propose(action)) {
			return false;
		}
		this.cw.SendNext();
		return true;
	}
}
