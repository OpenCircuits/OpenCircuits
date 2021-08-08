
export class ProposedEntry<T> {
	public Action: T;
	public ProposedClock: number;
	public SchemaVersion: string;
	public UserID: string;
}
export class AcceptedEntry<T> extends ProposedEntry<T> {
	public acceptedClock: number;
}

//
// Message sent TO the client
//
export class ProposeAck {
	public kind: "propose_ack";
	public AcceptedClock: number;
}

export class WelcomeMessage<T> {
	public kind: "welcome_message";
	public MissedEntries: AcceptedEntry<T>[];
}

export class NewEntries<T> {
	public kind: "new_entries";
	public Entries: AcceptedEntry<T>[];
}

export class CloseMessage {
	public kind: "close";
	public Reason: string;
}

export type Response<T> =
	| ProposeAck
	| WelcomeMessage<T>
	| NewEntries<T>
	| CloseMessage;

// TODO: Make this less dumb
export function Deserialize<T>(s: string): Response<T> {
	const o: any = JSON.parse(s);
	switch(o["kind"]){
	case "propose_ack":
		const a: ProposeAck = JSON.parse(s);
		return a;
	case "welcome_message":
		const b: WelcomeMessage<T> = JSON.parse(s);
		return b;
	case "new_entries":
		const c: NewEntries<T> = JSON.parse(s);
		return c;
	default:
		return undefined;
	}
}

//
// Message sent FROM the client
//

export class ProposeEntry<T> extends ProposedEntry<T> {
	kind: "propose";
}

export class JoinDocument {
	kind: "join_document";
	LogClock: number;
}

export type Message<T> = 
	| ProposeEntry<T>
	| JoinDocument;

export function Serialize<T>(m: Message<T>): string {
	return JSON.stringify(m);
}