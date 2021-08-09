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

    public Accept(accepted: AcceptedEntry<M>, local: boolean, success: boolean): boolean {
        if (accepted.acceptedClock != this.logClock) {
            return false;
        }
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