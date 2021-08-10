import { assert } from "console";
import { ActionTransformer, OTModel } from "./Interfaces";
import { AcceptedEntry } from "./Protocol";

// See ChangelogEntry in changelog.go
export class ChangelogEntry<M extends OTModel> {
    public inner: AcceptedEntry<M>;

    public local: boolean;
    public success: boolean
}


export class Changelog<M extends OTModel> {
    private entries: ChangelogEntry<M>[];
    private logClock: number;

    public constructor(es: ChangelogEntry<M>[] = new Array<ChangelogEntry<M>>(), clock: number = 0) {
        this.entries = es;
        this.logClock = clock;
    }

    public Accept(accepted: AcceptedEntry<M>, local: boolean, success: boolean): void {
        assert(accepted.acceptedClock == this.logClock);
        this.entries.push({
            inner: accepted,
            local: local,
            success: success
        });
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