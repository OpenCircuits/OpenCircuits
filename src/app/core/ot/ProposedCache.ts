import { Action, ActionTransformer, OTModel } from "./Interfaces";
import { ProposedEntry } from "./Protocol";

export class ProposedCache<M extends OTModel> {
    private sent: ProposedEntry<M>[];
    private pending: ProposedEntry<M>[];

    public constructor() {
        this.sent = new Array<ProposedEntry<M>>();
        this.pending = new Array<ProposedEntry<M>>();
    }

    public Push(e: ProposedEntry<M>): void {
        this.pending.push(e);
    }

    public PopSent(): ProposedEntry<M> | undefined {
        if (this.sent.length == 0) {
            return undefined;
        }
        return this.sent.shift();
    }

    public SendNext(): ProposedEntry<M> | undefined {
        // Only one in the sent list at a time
        if (this.sent.length != 0) {
            return undefined;
        }

        // Try to pop the next pending one
        const send = this.pending.shift();
        if (send == undefined) {
            return undefined;
        }
        this.sent.push(send);
        return send;
    }

    public Revert(m: M): void {
        for (let i = this.pending.length - 1; i >= 0; --i) {
            this.pending[i].Action.Inverse().Apply(m);
        }
        for (let i = this.sent.length - 1; i >= 0; --i) {
            this.sent[i].Action.Inverse().Apply(m);
        }
    }

    public TransformApply(xf: ActionTransformer<M>, m: M, a: Action<M>): void {
        // Don't filter the sent entries, since they're in-flight
        this.sent.forEach(e => {
            xf.Transform(e.Action, a);
            e.Action.Apply(m);
        });

        // Filter based on application success so the client doesn't waste time
        //	sending failed actions to the server
        this.pending = this.pending.filter(e => {
            xf.Transform(e.Action, a);
            return e.Action.Apply(m);
        });
    }
}