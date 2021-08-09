import { assert } from "console";
import { Action, OTModel } from "./Interfaces";
import { AcceptedEntry } from "./Protocol";

// See ChangelogEntry in changelog.go
export class ChangelogEntry<M extends OTModel> {
	public inner: AcceptedEntry<M>;

	public local: boolean;
}


export class Changelog<M extends OTModel> {
	private entries: ChangelogEntry<M>[];
	private logClock: number;

	public Accept(accepted: AcceptedEntry<M>, local: boolean): void {
		assert(accepted.acceptedClock == this.logClock);
		const entry = new ChangelogEntry();
		entry.inner = accepted;
		entry.local = local;

		// Transform the entry against everything it hasn't seen
		for (let i: number = accepted.ProposedClock; i < this.logClock; ++i) {
			entry.inner.Action.Transform(this.entries[i].inner.Action);
		}

		this.entries.push(entry);
		this.logClock++;
	}

	public Clock(): number {
		return this.logClock;
	}
}