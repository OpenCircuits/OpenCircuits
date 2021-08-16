import {strict} from "assert";
import {OTModel} from "./Interfaces";
import {OTDocument} from "./OTDocument";
import {CloseMessage, Connection, NewEntries, ProposeAck, ProposedEntry, ProposeEntry, Response, WelcomeMessage} from "./Protocol";

// The helper class for handling protocol messages
export class ConnectionWrapper<M extends OTModel> {
    private doc: OTDocument<M>;
    private conn: Connection<M>;

    private proposed?: ProposedEntry<M>;

    public constructor(doc: OTDocument<M>, conn: Connection<M>) {
        this.doc = doc;
        this.conn = conn;
        this.conn.OnMessage(m => this.handler(m));
    }

    private handler(m: Response): void {
        if (m instanceof ProposeAck) {
            // console.log("received ack message: " + JSON.stringify(m.AcceptedClock));
            this.AckHandler(m.AcceptedClock);
        } else if (m instanceof NewEntries) {
            // console.log("received new entries: " + JSON.stringify(m.Entries));
            this.doc.RecvRemote(m.Entries);
        } else if (m instanceof WelcomeMessage) {
            // console.log("received welcome message: " + JSON.stringify(m.MissedEntries));
            this.doc.RecvRemote(m.MissedEntries);
        } else if (m instanceof CloseMessage) {
            console.log("Unexpected close message: " + JSON.stringify(m.Reason));
        }
    }

    public AckHandler(acceptedClock: number): void {
        strict.ok(this.proposed, "received unexpected ack message");
        this.doc.RecvLocal({
            AcceptedClock: acceptedClock,
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

        const p = new ProposeEntry<M>();
        p.Action = send.Action;
        p.ProposedClock = send.ProposedClock;
        p.SchemaVersion = send.SchemaVersion;
        p.UserID = send.UserID;
        this.conn.Propose(p);
        return true;
    }
}
