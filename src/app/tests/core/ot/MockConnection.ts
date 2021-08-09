import { OTModel } from "core/ot/Interfaces";
import { Connection, JoinDocument, ProposedEntry, Response } from "core/ot/Protocol";

export class MockConnection<M extends OTModel> implements Connection<M> {
	public Proposed: ProposedEntry<M>;
	public JoinDoc: JoinDocument
	Propose(e: ProposedEntry<M>): void {
		this.Proposed = e;
	}
	Join(e: JoinDocument): void {
		this.JoinDoc = e;

	}
	Handler: (m: Response<M>) => void;
}