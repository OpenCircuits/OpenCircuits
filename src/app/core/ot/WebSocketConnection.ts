import {strict} from "assert";
import {RawAction, RawConnection} from "./JSONConnection";
import {JoinDocument, Message, ProposeEntry, ResponseHandler, Response} from "./Protocol";

export type ClockProvider = {
    Clock(): number
};

class MessageWrapper<T> {
    Type: string;
    Msg: T;
}


function deserializeJSON(s: string): Response<RawAction> {
    console.log(s);
    const res: MessageWrapper<Response<RawAction>> = JSON.parse(s);
    switch (res.Type) {
        case "ProposeAck":
        case "NewEntries":
        case "WelcomeMessage":
        case "CloseMessage":
            res.Msg.kind = res.Type;
            break;
        default:
            strict.ok(false, "Received unexpected message type from server");
    }
    return res.Msg;
}
function serializeJSON(m: Message<RawAction>): string {
    let msg: MessageWrapper<Message<RawAction>> = {
        Type: m.kind.toString(),
        Msg: m,
    };
    const s = JSON.stringify(msg);
    console.log(s);
    return s;
}

// Manages an unreliable connection with the server while providing a
//	consistent interface
export class WebSocketConnection implements RawConnection {
    private url: string;
    private ws: WebSocket;
    private clock: ClockProvider;
    private ready: boolean;
    private pending?: ProposeEntry<RawAction>;

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

    OnMessage(h: ResponseHandler<RawAction>): void {
        this.ws.onmessage = rawMsg => {
            if (rawMsg.data == undefined) {
                return;
            }
            h(deserializeJSON(rawMsg.data));
        };
    }

    async Propose(e: ProposeEntry<RawAction>): Promise<void> {
        if (!this.ready) {
            strict.strictEqual(this.pending, undefined, "proposed twice before getting ack");
            this.pending = e;
        } else {
            this.ws.send(serializeJSON(e));
        }
    }

    private openHandler(): void {
        this.ws.send(serializeJSON({
            kind: "JoinDocument",
            LogClock: this.clock.Clock(),
        }));
        this.ready = true;
        if (this.pending) {
            this.ws.send(serializeJSON(this.pending));
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
