import {strict} from "assert";
import {Action, OTModel} from "./Interfaces";
import {ClientInfoProvider, OTDocument} from "./OTDocument";
import {Connection, ProposeEntry, Response} from "./Protocol";

// The helper class for handling protocol messages
export class ConnectionWrapper<M extends OTModel> {
    private doc: OTDocument<M>;
    private conn: Connection<Action<M>>;
    private clientInfo: ClientInfoProvider

    private proposed?: ProposeEntry<Action<M>>;

    public constructor(doc: OTDocument<M>, conn: Connection<Action<M>>, clientInfo: ClientInfoProvider) {
        this.doc = doc;
        this.conn = conn;
        this.clientInfo = clientInfo;
        this.conn.OnMessage(m => this.handler(m));
    }

    private handler(m: Response<Action<M>>): void {
        switch (m.kind) {
            case "ProposeAck":
                // console.log("received ack message: " + JSON.stringify(m.AcceptedClock));
                this.AckHandler(m.AcceptedClock);
                break;
            case "NewEntries":
                // console.log("received new entries: " + JSON.stringify(m.Entries));
                this.doc.RecvRemote(m.Entries);
                break;
            case "WelcomeMessage":
                // console.log("received welcome message: " + JSON.stringify(m.MissedEntries));
                this.doc.RecvRemote(m.MissedEntries);
                break;
            case "CloseMessage":
                console.log("Unexpected close message: " + JSON.stringify(m.Reason));
                break;
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

        this.proposed = {
            kind: "ProposeEntry",
            Action: send,
            ProposedClock: this.doc.Clock(),
            SchemaVersion: this.clientInfo.SchemaVersion(),
            UserID: this.clientInfo.UserID(),
        }
        this.conn.Propose(this.proposed);
        return true;
    }
}
