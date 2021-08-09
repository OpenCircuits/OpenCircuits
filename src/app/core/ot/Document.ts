import { Changelog } from "./Changelog";
import { Action, OTModel } from "./Interfaces";
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
	private comm: Connection<M>;
	private clientInfo: ClientInfoProvider;

	private log: Changelog<M>;
	private sent: ProposedEntry<M>[];
	private pending: ProposedEntry<M>[];

	public constructor(doc: M, comm: Connection<M>, clientInfo: ClientInfoProvider) {
		this.doc = doc;
		this.comm = comm;
		this.comm.Handler = this.handler;
		this.clientInfo = clientInfo;

		// TODO: Load these from localstorage... or something?
		this.log = new Changelog<M>();
		this.sent = [];
		this.pending = [];
	}

	public Propose(action: Action<M>): void {
		const e: ProposedEntry<M> = {
			Action: action,
			ProposedClock: 0,
			SchemaVersion: this.clientInfo.SchemaVersion(),
			UserID: this.clientInfo.UserID()
		};
		this.pending.push(e);
		action.Apply(this.doc);

		// Send the next pending entry (if the new action is the only one)
		this.sendNext();
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
		this.log.Accept(entry, local);

		// Revert document back to log-state
		for (let i = this.pending.length - 1; i >= 0; --i) {
			this.pending[i].Action.Inverse().Apply(this.doc);
		}
		for (let i = this.sent.length - 1; i >= 0; --i) {
			this.sent[i].Action.Inverse().Apply(this.doc);
		}

		// Apply new log entry
		entry.Action.Apply(this.doc)

		// Apply local changes again, transformed this time
		this.sent.forEach(e => {
			e.Action.Transform(entry.Action);
			e.Action.Apply(this.doc);
		});
		this.pending.forEach(e => {
			e.Action.Transform(entry.Action);
			e.Action.Apply(this.doc);
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