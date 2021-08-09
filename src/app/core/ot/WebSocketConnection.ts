import { RawConnection, RawConnectionFactory } from "./Connection";

class WebSocketConnection implements RawConnection {
	private ws: WebSocket;
	public constructor(ws: WebSocket) {
		this.ws = ws;
	}

	Send(s: string): void {
		this.ws.send(s);
	}
	OnMessage(h: (s: string) => void): void {
		this.ws.onmessage = ev => {
			h(ev.data);
		};
	}
}

export class WebSocketConnectionFactory implements RawConnectionFactory {
	public url: string;
	Connect(onOpen: () => void, onClose: () => void): RawConnection {
		const ws = new WebSocket(this.url);
		ws.onclose = onClose;
		ws.onopen = onOpen;
		return new WebSocketConnection(ws)
	}
}