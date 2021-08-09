import { OTModel } from "./Interfaces";
import { OTDocument } from "./OTDocument";
import { AcceptedEntry, Connection, Response } from "./Protocol";

// The helper class for handling protocol messages
export class DocConnWrapper<M extends OTModel> {
	private doc: OTDocument<M>;
	private conn: Connection<M>;

	public constructor(doc: OTDocument<M>, conn: Connection<M>) {
		this.doc = doc;
		this.conn = conn;
		this.conn.Handler = this.handler;
	}

	private handler(m: Response<M>): void {
		switch (m.kind) {
			case "propose_ack":
				this.AckHandler(m.AcceptedClock);
				break;
			case "new_entries":
				this.NewEntriesHandler(m.Entries, false);
				break;
			case "welcome_message":
				this.NewEntriesHandler(m.MissedEntries, false);
				break;
			case "close":
				console.log("Unexpected close message: " + m.Reason);
				break;
			default:
				const _exhaustiveCheck: never = m;
		}
	}

	public AckHandler(acceptedClock: number): void {
		this.doc.RecvLocal(acceptedClock);

		// Send the next pending entry
		this.SendNext();
	}

	public NewEntriesHandler(entries: AcceptedEntry<M>[], local: boolean): void {
		entries.forEach(e => {
			this.doc.Recv(e, local);
		});
	}

	public SendNext(): boolean {
		const send = this.doc.SendNext();
		if (send == undefined) {
			return false;
		}
		this.conn.Propose(send);
		return true;
	}
}
