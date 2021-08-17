import {string} from "yargs";

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

export interface SessionJoined {
    UserID: string;
    SessionID: string;
}
export interface SessionLeft {
    SessionID: string;
}

export interface Updates<A> {
    kind: "Updates";
    NewEntries: AcceptedEntry<A>[]
    SessionsJoined: SessionJoined[]
    SessionsLeft: SessionLeft[]
}

export function MapU<A, B>(a: Updates<A>, f: (_: A) => B): Updates<B> {
    return {
        kind: "Updates",
        NewEntries: a.NewEntries?.map(v => MapAE(v, f)),
        SessionsJoined: a.SessionsJoined,
        SessionsLeft: a.SessionsLeft,
    };
}


export interface ProposeAck<A> {
    kind: "ProposeAck";
    AcceptedClock: number;
    Updates: Updates<A>;
}

export function MapPA<A, B>(a: ProposeAck<A>, f: (_: A) => B): ProposeAck<B> {
    return {
        kind: "ProposeAck",
        AcceptedClock: a.AcceptedClock,
        Updates: MapU(a.Updates, f)
    };
}

export interface WelcomeMessage<A> {
    kind: "WelcomeMessage";
    Session: SessionJoined;
    MissedEntries: AcceptedEntry<A>[];
    Sessions: SessionJoined[];
}

export function MapWM<A, B>(a: WelcomeMessage<A>, f: (_: A) => B): WelcomeMessage<B> {
    return {
        kind: a.kind,
        Session: a.Session,
        MissedEntries: a.MissedEntries.map(v => MapAE(v, f)),
        Sessions: a.Sessions,
    };
}


export interface CloseMessage {
    kind: "CloseMessage";
    Reason: string;
}

export type Response<A> =
    | ProposeAck<A>
    | WelcomeMessage<A>
    | Updates<A>
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
