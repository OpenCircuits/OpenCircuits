import {strict} from "assert";
import {Changelog} from "./Changelog";
import {Action, ActionTransformer, OTModel} from "./Interfaces";
import {PendingCache} from "./PendingCache";
import {AcceptedEntry, ProposedEntry} from "./Protocol";

// This is still kind of a hack
export interface ClientInfoProvider {
    UserID(): string;
    SchemaVersion(): string
}


// The main OT document logic
export class OTDocument<M extends OTModel> {
    private model: M;
    private log: Changelog<M>;
    private propCache: PendingCache<M>;

    private xf: ActionTransformer<M>;
    private clientInfo: ClientInfoProvider;

    public constructor(model: M, log: Changelog<M>, propCache: PendingCache<M>, xf: ActionTransformer<M>, clientInfo: ClientInfoProvider) {
        this.model = model;
        this.log = log;
        this.propCache = propCache;

        this.xf = xf;
        this.clientInfo = clientInfo;
    }

    public Clock(): number {
        return this.log.Clock();
    }

    public Propose(action: Action<M>): boolean {
        // NOTE: This means the action is valid for the current local state
        //  but that may change as remote changes are received
        return this.propCache.Push(this.model, action);
    }

    public RecvLocal(entry: AcceptedEntry<M>): void {
        // Remove from the "sent" list
        const succ = this.propCache.PopSent()
        strict.ok(succ, "received unexpected ack entry");

        // Action is already applied and transformed, just add it to the log
        this.log.Accept(entry, true, succ);
    }

    public RecvRemote(es: AcceptedEntry<M>[]): void {
        if (es.length === 0) {
            return;
        }

        // Revert document back to log-state ...
        this.propCache.Revert(this.model);

        es.forEach(e => {
            // ... and transform the entry ...
            this.log.TransformReceived(this.xf, e);

            // ... before applying it, ...
            //  (this shouldn't fail, but it won't break if it does)
            const success = e.Action.Apply(this.model);

            // ... adding to the log, ...
            this.log.Accept(e, false, success);
        });

        // ... and re-applying the transformed pending entries.
        this.propCache.TransformApply(this.xf, this.model, es.map(e => e.Action));
    }

    public SendNext(): ProposedEntry<M> | undefined {
        const action = this.propCache.SendNext();
        if (action == undefined) {
            return undefined;
        }
        return {
            Action: action,
            ProposedClock: this.log.Clock(),
            SchemaVersion: this.clientInfo.SchemaVersion(),
            UserID: this.clientInfo.UserID()
        };
    }
}