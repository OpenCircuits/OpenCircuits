import { assert } from "console";
import { OTModel } from "./Interfaces";
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

		this.entries.push(entry);
		this.logClock++;
	}

	public Index(i: number): ChangelogEntry<M> {
		return this.entries[i];
	}

	public Clock(): number {
		return this.logClock;
	}
}