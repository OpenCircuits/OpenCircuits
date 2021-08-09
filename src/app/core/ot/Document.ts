import { Changelog } from "./Changelog";
import { Action, ActionTransformer, OTModel } from "./Interfaces";
import { AcceptedEntry, JoinDocument, ProposedEntry, Response } from "./Protocol";

export interface Connection<M extends OTModel> {
	Propose(e: ProposedEntry<M>): void;
	Join(e: JoinDocument): void;
	Handler: (m: Response<M>) => void;
}

export interface ClientInfoProvider {
	UserID(): string;
	SchemaVersion(): string
}

export class Document<M extends OTModel> {
	private doc: M;
	private xf: ActionTransformer<M>;
	private comm: Connection<M>;
	private clientInfo: ClientInfoProvider;

	private log: Changelog<M>;
	private sent: ProposedEntry<M>[];
	private pending: ProposedEntry<M>[];

	public constructor(doc: M, xf: ActionTransformer<M>, comm: Connection<M>, clientInfo: ClientInfoProvider) {
		this.doc = doc;
		this.xf = xf;
		this.comm = comm;
		this.comm.Handler = this.handler;
		this.clientInfo = clientInfo;

		// TODO: Load these from localstorage... or something?
		this.log = new Changelog<M>();
		this.sent = [];
		this.pending = [];
	}

	public Propose(action: Action<M>): void {
		if (action.Apply(this.doc)) {
			const e: ProposedEntry<M> = {
				Action: action,
				ProposedClock: 0,
				SchemaVersion: this.clientInfo.SchemaVersion(),
				UserID: this.clientInfo.UserID()
			};
			this.pending.push(e);

			// Send the next pending entry (if the new action is the only one)
			this.sendNext();
		}
	}

	private handler(m: Response<M>): void {
		switch (m.kind) {
			case "propose_ack":
				this.ackHandler(m.AcceptedClock);
				break;
			case "new_entries":
				m.Entries.forEach(e => {
					this.recv(e, false);
				});
				break;
			case "welcome_message":
				m.MissedEntries.forEach(e => {
					this.recv(e, false);
				});
				break;
			case "close":
				console.log("Unexpected close message: " + m.Reason);
				break;
			default:
				const _exhaustiveCheck: never = m;
		}
	}

	private ackHandler(acceptedClock: number): void {
		// Remove from the "sent" list
		const entry = this.sent.shift();

		// Apply entry to the document and log
		let accEntry: AcceptedEntry<M> = {
			acceptedClock: acceptedClock,
			...entry
		};
		this.recv(accEntry, true);

		// Send the next pending entry
		this.sendNext();
	}

	private recv(entry: AcceptedEntry<M>, local: boolean): void {
		// Revert document back to log-state
		for (let i = this.pending.length - 1; i >= 0; --i) {
			this.pending[i].Action.Inverse().Apply(this.doc);
		}
		for (let i = this.sent.length - 1; i >= 0; --i) {
			this.sent[i].Action.Inverse().Apply(this.doc);
		}

		// Transform the entry against everything it hasn't seen...
		for (let i: number = entry.ProposedClock; i < this.log.Clock(); ++i) {
			this.xf.Transform(entry.Action, this.log.Index(i).inner.Action);
		}
		// ... before adding to the log
		this.log.Accept(entry, local);

		// Apply new log entry.  This shouldn't fail, but it won't break if it does
		entry.Action.Apply(this.doc);

		// Apply local changes again, transformed this time
		//	Filter based on application success so the client doesn't waste time
		//	sending failed actions to the server
		this.sent = this.sent.filter(e => {
			this.xf.Transform(e.Action, entry.Action);
			return e.Action.Apply(this.doc);
		});
		this.pending = this.pending.filter(e => {
			this.xf.Transform(e.Action, entry.Action);
			return e.Action.Apply(this.doc);
		});
	}

	private sendNext(): void {
		if (this.sent.length != 0) {
			return;
		}

		const send = this.pending.shift();
		if (send == undefined) {
			return;
		}

		send.ProposedClock = this.log.Clock();
		this.sent.push(send);
		this.comm.Propose(send);
	}
}