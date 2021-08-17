import {strict} from "assert";
import {Deserialize, Serialize} from "serialeazy";
import {Action, OTModel} from "./Interfaces";
import {Connection, MapNE, MapPE, MapWM, ProposeEntry, Response, ResponseHandler} from "./Protocol";

// Transport format of the Action (NOT used by the server)
// TODO: This should be an in-line object to avoid double-escaping
export type RawAction = string;
function deAction<M extends OTModel>(m: RawAction): Action<M> {
    return Deserialize<Action<M>>(m);
}
function seAction<M extends OTModel>(a: Action<M>): RawAction {
    return Serialize(a);
}
export interface RawConnection {
    Propose(p: ProposeEntry<RawAction>): void;
    OnMessage(h: ResponseHandler<RawAction>): void;
}

export function DeserializeMessage<M extends OTModel>(res: Response<RawAction>): Response<Action<M>> {
    switch (res.kind) {
        case "ProposeAck":
            return res;
        case "NewEntries":
            return MapNE(res, deAction);
        case "WelcomeMessage":
            return MapWM(res, deAction);
        case "CloseMessage":
            return res;
        default:
            strict.ok(false, "Received unexpected message type from server");
    }
}


export class JSONConnection<M extends OTModel> implements Connection<Action<M>> {
    public constructor(
        private conn: RawConnection
    ) { };
    Propose(p: ProposeEntry<Action<M>>): void {
        this.conn.Propose(MapPE(p, seAction));
    }
    OnMessage(h: ResponseHandler<Action<M>>): void {
        this.conn.OnMessage(s => {
            h(DeserializeMessage(s));
        })
    }
}