import {Action, OTModel} from "./Interfaces";

export class ProposedEntry<M extends OTModel> {
    public Action: Action<M>;
    public ProposedClock: number = 0;
    public SchemaVersion: string = "UNDEFINED_SCHEMA_VERSION";
    public UserID: string = "UNDEFINED_USER_ID";
}
export class AcceptedEntry<M extends OTModel> extends ProposedEntry<M> {
    public AcceptedClock: number = 0;
}

export type ResponseHandler<M> = (m: Response<M>) => void;
export interface Connection<M extends OTModel> {
    Propose(p: ProposeEntry<M>): void;
    OnMessage(h: ResponseHandler<M>): void;
}

//
// Message sent TO the client
//
export class ProposeAck {
    public kind: "propose_ack";
    public AcceptedClock: number;
}

export class WelcomeMessage<M extends OTModel> {
    public kind: "welcome_message";
    public MissedEntries: AcceptedEntry<M>[];
}

export class NewEntries<M extends OTModel> {
    public kind: "new_entries";
    public Entries: AcceptedEntry<M>[];
}

export class CloseMessage {
    public kind: "close";
    public Reason: string;
}

export type Response<M extends OTModel> =
    | ProposeAck
    | WelcomeMessage<M>
    | NewEntries<M>
    | CloseMessage;

// TODO: Make this less dumb
export function Deserialize<M extends OTModel>(s: string): Response<M> {
    const o: any = JSON.parse(s);
    switch (o["kind"]) {
        case "propose_ack":
            const a: ProposeAck = JSON.parse(s);
            return a;
        case "welcome_message":
            const b: WelcomeMessage<M> = JSON.parse(s);
            return b;
        case "new_entries":
            const c: NewEntries<M> = JSON.parse(s);
            return c;
        default:
            return undefined;
    }
}

//
// Message sent FROM the client
//

export class ProposeEntry<M extends OTModel> extends ProposedEntry<M> {
    kind: "propose";
}

export class JoinDocument {
    kind: "join_document";
    LogClock: number;
}

export type Message<M extends OTModel> =
    | ProposeEntry<M>
    | JoinDocument;

export function Serialize<M extends OTModel>(m: Message<M>): string {
    return JSON.stringify(m);
}