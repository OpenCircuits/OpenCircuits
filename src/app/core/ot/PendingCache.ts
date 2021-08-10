import { Action, ActionTransformer, OTModel } from "./Interfaces";

export class AppliedAction<M extends OTModel>{
    public action: Action<M>;
    public success: boolean;
}

// TODO: Put this in localstorage or something?
//				On save, put the "sent" back into the "pending"
export class PendingCache<M extends OTModel> {
    private sent?: AppliedAction<M>;
    private pending: Action<M>[];

    public constructor() {
        this.pending = new Array<Action<M>>();
    }

    public Push(m: M, a: Action<M>): boolean {
        if (a.Apply(m)) {
            this.pending.push(a);
            return true;
        }
        return false;
    }

    public PopSent(): boolean | undefined {
        const success = this.sent?.success;
        this.sent = undefined;
        return success;
    }

    public SendNext(): Action<M> | undefined {
        // Only one in the sent list at a time
        if (this.sent != undefined) {
            return undefined;
        }

        // Try to pop the next pending one
        const send = this.pending.shift();
        if (send == undefined) {
            return undefined;
        }
        this.sent = {
            success: true,
            action: send
        };
        return send;
    }

    public Revert(m: M): void {
        for (let i = this.pending.length - 1; i >= 0; --i) {
            this.pending[i].Inverse().Apply(m);
        }
        this.sent?.action.Inverse().Apply(m);
    }

    public TransformApply(xf: ActionTransformer<M>, m: M, as: Action<M>[]): void {
        // Don't filter the sent entries, since they're in-flight
        if (this.sent != undefined) {
            as.forEach(a => {
                xf.Transform(this.sent.action, a);
            });
            // Since sent entries are _not_ filtered, keep track of
            //  their application success.
            this.sent.success = this.sent.action.Apply(m);
        }

        // Filter based on application success so the client doesn't waste time
        //	sending failed actions to the server.  Pending list only contains
        //  successfully applied actions.
        this.pending = this.pending.filter(p => {
            as.forEach(a => {
                xf.Transform(p, a);
            });
            return p.Apply(m);
        });
    }
}