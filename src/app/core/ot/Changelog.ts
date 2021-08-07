import { assert } from "console";
import { Action } from "./Interfaces";
import { AcceptedEntry } from "./Protocol";

// See ChangelogEntry in changelog.go
export class ChangelogEntry {
	public inner: AcceptedEntry<Action>;

	public local: boolean;
}


export class Changelog {
	private entries: ChangelogEntry[];
	private logClock: number;

	public Accept(accepted: AcceptedEntry<Action>, local: boolean): void {
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