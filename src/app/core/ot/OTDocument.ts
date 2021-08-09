import assert from "assert";
import { Changelog } from "./Changelog";
import { Action, ActionTransformer, OTModel } from "./Interfaces";
import { ProposedCache } from "./ProposedCache";
import { AcceptedEntry, ProposedEntry } from "./Protocol";

// This is still kind of a hack
export interface ClientInfoProvider {
	UserID(): string;
	SchemaVersion(): string
}


// The main OT document logic
export class OTDocument<M extends OTModel> {
	private model: M;
	private log: Changelog<M>;
	private propCache: ProposedCache<M>;

	private xf: ActionTransformer<M>;
	private clientInfo: ClientInfoProvider;

	public constructor(model: M, log: Changelog<M>, propCache: ProposedCache<M>, xf: ActionTransformer<M>, clientInfo: ClientInfoProvider) {
		this.model = model;
		this.log = log;
		this.propCache = propCache;

		this.xf = xf;
		this.clientInfo = clientInfo;
	}

	public Propose(action: Action<M>): boolean {
		// The action must be applied before being added
		if (action.Apply(this.model)) {
			const e: ProposedEntry<M> = {
				Action: action,
				ProposedClock: 0,
				SchemaVersion: this.clientInfo.SchemaVersion(),
				UserID: this.clientInfo.UserID()
			};
			this.propCache.Push(e);
			return true;
		}
		return false;
	}

	public RecvLocal(acceptedClock: number): void {
		// Remove from the "sent" list
		const entry = this.propCache.PopSent()
		assert(entry != undefined);

		// Apply entry to the document and log
		let accEntry: AcceptedEntry<M> = {
			acceptedClock: acceptedClock,
			...entry
		};

		this.Recv(accEntry, true);
	}

	public Recv(entry: AcceptedEntry<M>, local: boolean): void {
		// Revert document back to log-state ...
		this.propCache.Revert(this.model);

		// ... and transform the entry ...
		this.log.TransformReceived(this.xf, entry);

		// ... before adding to the log
		this.log.Accept(entry, local);

		// Apply new log entry (this shouldn't fail, but it won't break if it does)
		entry.Action.Apply(this.model);

		// Apply local changes again, transformed this by the new action
		this.propCache.TransformApply(this.xf, this.model, entry.Action);
	}

	public SendNext(): ProposedEntry<M> | undefined {
		const send = this.propCache.SendNext();
		if (send == undefined) {
			return;
		}

		// Propose to the server
		send.ProposedClock = this.log.Clock();
		return send;
	}
}