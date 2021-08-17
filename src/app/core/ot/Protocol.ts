
export type ResponseHandler<A> = (m: Response<A>) => void;
export interface Connection<A> {
    Propose(p: ProposeEntry<A>): void;
    OnMessage(h: ResponseHandler<A>): void;
}

//
// Message sent TO the client
//

export class AcceptedEntry<A> {
    Action: A;
    ProposedClock: number = 0;
    AcceptedClock: number = 0;
    SchemaVersion: string = "UNDEFINED_SCHEMA_VERSION";
    UserID: string = "UNDEFINED_USER_ID";

    static Map<A, B>(a: AcceptedEntry<A>, f: (_: A) => B): AcceptedEntry<B> {
        return {
            Action: f(a.Action),
            ProposedClock: a.ProposedClock,
            AcceptedClock: a.AcceptedClock,
            SchemaVersion: a.SchemaVersion,
            UserID: a.UserID,
        };
    }
}


export interface ProposeAck {
    kind: "ProposeAck";
    AcceptedClock: number;
}

export interface WelcomeMessage<A> {
    kind: "WelcomeMessage";
    MissedEntries: AcceptedEntry<A>[];
}

export interface NewEntries<A> {
    kind: "NewEntries";
    Entries: AcceptedEntry<A>[];
}

export interface CloseMessage {
    kind: "CloseMessage";
    Reason: string;
}

export type Response<A> =
    | ProposeAck
    | WelcomeMessage<A>
    | NewEntries<A>
    | CloseMessage;


//
// Message sent FROM the client
//

export interface ProposeEntry<A> {
    kind: "ProposeEntry"
    Action: A;
    ProposedClock: number;
    SchemaVersion: string;
    UserID: string;
}

export function MapPE<A, B>(a: ProposeEntry<A>, f: (_: A) => B): ProposeEntry<B> {
    return {
        kind: "ProposeEntry",
        Action: f(a.Action),
        ProposedClock: a.ProposedClock,
        SchemaVersion: a.SchemaVersion,
        UserID: a.UserID,
    }
}

export interface JoinDocument {
    kind: "JoinDocument"
    LogClock: number;
}

export type Message<A> =
    | ProposeEntry<A>
    | JoinDocument;
