import { assert } from "console";
import { ActionTransformer, OTModel } from "./Interfaces";
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

    public TransformReceived(xf: ActionTransformer<M>, e: AcceptedEntry<M>): void {
        // Transform the entry against everything it hasn't seen
        for (let i: number = e.ProposedClock; i < this.logClock; ++i) {
            xf.Transform(e.Action, this.entries[i].inner.Action);
        }
    }

    public Index(i: number): ChangelogEntry<M> {
        return this.entries[i];
    }

    public Clock(): number {
        return this.logClock;
    }
}