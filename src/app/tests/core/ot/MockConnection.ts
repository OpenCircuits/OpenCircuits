import { Connection } from "core/ot/Document";
import { JoinDocument, ProposedEntry, Response } from "core/ot/Protocol";
import { MockModel } from "./MockModel";

export class MockConnection implements Connection<MockModel> {
	public Proposed: ProposedEntry<MockModel>;
	public JoinDoc: JoinDocument
	Propose(e: ProposedEntry<MockModel>): void {
		this.Proposed = e;
	}
	Join(e: JoinDocument): void {
		this.JoinDoc = e;

	}
	Handler: (m: Response<MockModel>) => void;
}