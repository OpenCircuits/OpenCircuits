import assert from "assert";
import { OTModel } from "./Interfaces";
import { OTDocument } from "./OTDocument";
import { AcceptedEntry, Connection, JoinDocument, ProposedEntry, Response } from "./Protocol";

// The helper class for handling protocol messages
export class ConnectionWrapper<M extends OTModel> {
    private doc: OTDocument<M>;
    private conn: Connection<M>;

    private proposed?: ProposedEntry<M>;

    public constructor(doc: OTDocument<M>, conn: Connection<M>) {
        this.doc = doc;
        this.conn = conn;
        this.conn.OnMessage(this.handler);
    }

    private handler(m: Response<M>): void {
        switch (m.kind) {
            case "propose_ack":
                this.AckHandler(m.AcceptedClock);
                break;
            case "new_entries":
                this.doc.RecvRemote(m.Entries);
                break;
            case "welcome_message":
                this.doc.RecvRemote(m.MissedEntries);
                break;
            case "close":
                console.log("Unexpected close message: " + m.Reason);
                break;
            default:
                const _exhaustiveCheck: never = m;
        }
    }

    public AckHandler(acceptedClock: number): void {
        assert(this.proposed, "received unexpected ack message");
        this.doc.RecvLocal({
            acceptedClock: acceptedClock,
            ...this.proposed
        });

        // Send the next pending entry
        this.SendNext();
    }

    public SendNext(): boolean {
        const send = this.doc.SendNext();
        if (send == undefined) {
            return false;
        }
        this.proposed = send;

        this.conn.Propose({
            kind: "propose",
            ...send
        });
        return true;
    }
}
