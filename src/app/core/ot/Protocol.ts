import {strict} from "assert";
import {Action, OTModel} from "./Interfaces";
import {deserialize_poly, message, serialize} from "./Serializing";

export class ProposedEntry<M extends OTModel> {
    public Action: Action<M>;
    public ProposedClock: number = 0;
    public SchemaVersion: string = "UNDEFINED_SCHEMA_VERSION";
    public UserID: string = "UNDEFINED_USER_ID";
}
export class AcceptedEntry<M extends OTModel> extends ProposedEntry<M> {
    public AcceptedClock: number = 0;
}

export type ResponseHandler = (m: Response) => void;
export interface Connection<M extends OTModel> {
    Propose(p: ProposeEntry<M>): void;
    OnMessage(h: ResponseHandler): void;
}

//
// Message sent TO the client
//
@message("ProposeAck")
export class ProposeAck implements Response {
    public AcceptedClock: number = 0;
}

@message("WelcomeMessage")
export class WelcomeMessage<M extends OTModel> implements Response {
    public MissedEntries: AcceptedEntry<M>[] = new Array<AcceptedEntry<M>>();
}

@message("NewEntries")
export class NewEntries<M extends OTModel> implements Response {
    public Entries: AcceptedEntry<M>[] = new Array<AcceptedEntry<M>>();
}

@message("CloseMessage")
export class CloseMessage implements Response {
    public Reason: string = "";
}

export interface Response { };

export function Deserialize(s: string): Response {
    // TODO: We need 2 different kinds of serialization.  One can assume the protocol
    //  is followed, because parts of the data comes from the server, which is trusted.
    //  The other parses data coming from other clients, so it needs to be safe or else
    //  the document can effectively be broken by overwriting "Apply" or "Invert".
    const res = deserialize_poly<Response>(s);
    // console.log(s);
    strict.ok(res != undefined);
    return res;
}

//
// Message sent FROM the client
//

@message("ProposeEntry")
export class ProposeEntry<M extends OTModel> extends ProposedEntry<M> implements Message { } {
}

@message("JoinDocument")
export class JoinDocument implements Message {
    LogClock: number;
}

export interface Message { }

export function Serialize(m: Message): string {
    const str = serialize(m);
    strict.ok(str != undefined);
    return str;
}