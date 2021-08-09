import { OTModel } from "core/ot/Interfaces";
import { Connection, ProposedEntry, Response, ResponseHandler } from "core/ot/Protocol";

export class MockConnection<M extends OTModel> implements Connection<M> {
	public Proposed: ProposedEntry<M>;
	public Handler: ResponseHandler<M>;
	Respond(r: Response<M>): void {
		this.Handler(r);
	}
	Propose(e: ProposedEntry<M>): void {
		this.Proposed = e;
	}
	OnMessage(h: ResponseHandler<M>): void {
		this.Handler = h;
	}
}