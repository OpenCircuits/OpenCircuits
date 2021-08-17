import { Action, OTModel } from "core/ot/Interfaces";
import { Connection, ProposeEntry, Response, ResponseHandler } from "core/ot/Protocol";

export class MockConnection<M extends OTModel> implements Connection<Action<M>> {
    public Proposed: ProposeEntry<Action<M>>;
    public Handler: ResponseHandler<Action<M>>;
    Respond(r: Response<Action<M>>): void {
        this.Handler(r);
    }
    Propose(e: ProposeEntry<Action<M>>): void {
        this.Proposed = e;
    }
    OnMessage(h: ResponseHandler<Action<M>>): void {
        this.Handler = h;
    }
}