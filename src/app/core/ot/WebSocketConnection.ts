import {OTModel} from "./Interfaces";
import {Connection, Deserialize, ProposeEntry, ResponseHandler, Serialize} from "./Protocol";

export type ClockProvider = {
    Clock(): number
};

// Manages an unreliable connection with the server while providing a
//	consistent interface
export class WebSocketConnection<M extends OTModel> implements Connection<M> {
    private url: string;
    private ws: WebSocket;
    private clock: ClockProvider;

    public constructor(clock: ClockProvider, url: string) {
        this.clock = clock;
        this.connect();
    }

    OnMessage(h: ResponseHandler<M>): void {
        this.ws.onmessage = rawMsg => {
            h(Deserialize(rawMsg.data));
        };
    }

    Propose(e: ProposeEntry<M>): void {
        this.ws.send(Serialize(e));
    }

    private connect(): void {
        this.ws = new WebSocket(this.url, []);
        this.ws.onclose = this.closeHandler;
        this.ws.onopen = this.openHandler;
    }

    private openHandler(): void {
        this.ws.send(Serialize({
            kind: "join_document",
            LogClock: this.clock.Clock()
        }));
    }
    private closeHandler(): void {
        // This is where exponential back-off would happen... I think
        this.connect();
    }
}
