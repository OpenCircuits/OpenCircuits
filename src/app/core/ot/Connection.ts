import { OTModel } from "./Interfaces";
import { Deserialize, ProposeEntry, Response, Serialize } from "./Protocol";

export type ResponseHandler<M> = (m: Response<M>) => void;

// RawConnection is an unreliable connection
export interface RawConnection {
	Send(s: string): void;
	OnMessage(h: (s: string) => void): void;
}
export interface RawConnectionFactory {
	Connect(onOpen: () => void, onClose: () => void): RawConnection
}

export type ClockProvider = { Clock(): number };

// Connection manages an unreliable connection with the server while
//	providing a consistent interface
export class Connection<M extends OTModel> {
	private f: RawConnectionFactory;
	private conn: RawConnection;
	private h: ResponseHandler<M>;

	private clock: ClockProvider;

	public constructor(f: RawConnectionFactory, clock: ClockProvider, h: ResponseHandler<M>) {
		this.f = f;
		this.join();
		this.h = h;

		this.clock = clock;
	}

	private join(): void {
		this.conn = this.f.Connect(this.openHandler, this.closeHandler);
		this.conn.OnMessage((rawMsg) => {
			this.h(Deserialize(rawMsg));
		});
	}

	private openHandler(): void {
		this.conn.Send(Serialize({
			kind: "join_document",
			LogClock: this.clock.Clock()
		}));
	}
	private closeHandler(): void {
		// This is where exponential back-off would happen... I think
		this.join();
	}

	Propose(e: ProposeEntry<M>): void {
		this.conn.Send(Serialize(e));
	}
}
