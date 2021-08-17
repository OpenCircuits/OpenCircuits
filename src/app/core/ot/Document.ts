import {ClientSession} from "./ClientSession";
import {Action, OTModel} from "./Interfaces";
import {OTDocument} from "./OTDocument";

// The interface used by external code to interact with the OT model
export class Document<M extends OTModel> {
    private doc: OTDocument<M>;
    private cs: ClientSession<M>;

    public constructor(doc: OTDocument<M>, cs: ClientSession<M>) {
        this.doc = doc;
        this.cs = cs;
    }

    public Propose(action: Action<M>): boolean {
        if (!this.doc.Propose(action)) {
            return false;
        }
        this.cs.SendNext();
        return true;
    }
}
