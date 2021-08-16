import {strict} from "assert";
import {OTModel} from "./Interfaces";
import {Connection, Deserialize, JoinDocument, ProposeEntry, ResponseHandler, Serialize} from "./Protocol";

export type ClockProvider = {
    Clock(): number
};

// Manages an unreliable connection with the server while providing a
//	consistent interface
export class WebSocketConnection<M extends OTModel> implements Connection<M> {
    private url: string;
    private ws: WebSocket;
    private clock: ClockProvider;
    private ready: boolean;
    private pending?: ProposeEntry<M>;

    public constructor(clock: ClockProvider, url: string) {
        this.url = url;
        this.clock = clock;
    }

    public async Connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.ws = new WebSocket(this.url, []);
            this.ws.onclose = this.closeHandler;
            this.ws.onerror = (ev) => {
                reject("web socket error");
            };
            this.ws.onopen = () => {
                this.openHandler();
                resolve();
            };
        });
    }

    OnMessage(h: ResponseHandler): void {
        this.ws.onmessage = rawMsg => {
            if (rawMsg.data == undefined) {
                return;
            }
            h(Deserialize(rawMsg.data));
        };
    }

    async Propose(e: ProposeEntry<M>): Promise<void> {
        if (!this.ready) {
            strict.strictEqual(this.pending, undefined, "proposed twice before getting ack");
            this.pending = e;
        } else {
            this.ws.send(Serialize(e));
        }
    }

    private openHandler(): void {
        const j = new JoinDocument();
        j.LogClock = this.clock.Clock();

        this.ws.send(Serialize(j));
        this.ready = true;
        if (this.pending) {
            this.ws.send(Serialize(this.pending));
            this.pending = undefined;
        }
    }

    private async closeHandler(): Promise<void> {
        // This is a work-around because "this" may be undefined
        if (this.Connect) {
            // This is where exponential back-off would happen... I think
            await this.Connect();
        }
    }
}
