
export type ResponseHandler<A> = (m: Response<A>) => void;
export interface Connection<A> {
    Propose(p: ProposeEntry<A>): void;
    OnMessage(h: ResponseHandler<A>): void;
}

//
// Message sent TO the client
//

export interface AcceptedEntry<A> {
    Action: A;
    ProposedClock: number;
    AcceptedClock: number;
    SchemaVersion: string;
    UserID: string;
    SessionID: string;
}

export function MapAE<A, B>(a: AcceptedEntry<A>, f: (_: A) => B): AcceptedEntry<B> {
    return {
        Action: f(a.Action),
        ProposedClock: a.ProposedClock,
        AcceptedClock: a.AcceptedClock,
        SchemaVersion: a.SchemaVersion,
        UserID: a.UserID,
        SessionID: a.SessionID,
    };
}


export interface ProposeAck {
    kind: "ProposeAck";
    AcceptedClock: number;
}

export interface WelcomeMessage<A> {
    kind: "WelcomeMessage";
    SessionID: string;
    MissedEntries: AcceptedEntry<A>[];
}

export function MapWM<A, B>(a: WelcomeMessage<A>, f: (_: A) => B): WelcomeMessage<B> {
    return {
        kind: a.kind,
        SessionID: a.SessionID,
        MissedEntries: a.MissedEntries.map(v => MapAE(v, f)),
    };
}

export interface NewEntries<A> {
    kind: "NewEntries";
    Entries: AcceptedEntry<A>[];
}

export function MapNE<A, B>(a: NewEntries<A>, f: (_: A) => B): NewEntries<B> {
    return {
        kind: a.kind,
        Entries: a.Entries.map(v => MapAE(v, f)),
    };
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
}

export function MapPE<A, B>(a: ProposeEntry<A>, f: (_: A) => B): ProposeEntry<B> {
    return {
        kind: "ProposeEntry",
        Action: f(a.Action),
        ProposedClock: a.ProposedClock,
        SchemaVersion: a.SchemaVersion,
    }
}

export interface JoinDocument {
    kind: "JoinDocument"
    LogClock: number;
    AuthType: string;
    AuthID: string;
}

export type Message<A> =
    | ProposeEntry<A>
    | JoinDocument;
