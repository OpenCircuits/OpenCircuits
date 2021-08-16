import "jest"

const os = require("os");

import {Changelog} from "core/ot/Changelog";
import {OTDocument} from "core/ot/OTDocument";
import {PendingCache} from "core/ot/PendingCache";
import {MockClientInfoProvider} from "./MockClientInfoProvider";
import {InsertTextAction, TextActionTransformer, TextModel} from "./TextModel";
import {Document} from "core/ot/Document";
import {ConnectionWrapper} from "core/ot/ConnectionWrapper";
import {WebSocketConnection} from "core/ot/WebSocketConnection";
import {spawn} from "child_process";


type M = TextModel;

async function newClient(port: string, circuitID: string) {
    const m = new TextModel();
    const l = new Changelog<M>();
    const pc = new PendingCache<M>();
    const xf = new TextActionTransformer();
    const cl = new MockClientInfoProvider();
    const doc = new OTDocument<M>(m, l, pc, xf, cl);
    const conn = new WebSocketConnection(doc, `ws://localhost:${port}/ot/${circuitID}`);
    await conn.Connect();
    const cw = new ConnectionWrapper<M>(doc, conn);
    const iface = new Document<M>(doc, cw);
    return {
        model: m,
        log: l,
        cache: pc,
        xf: xf,
        cl: cl,
        doc: doc,
        conn: conn,
        cw: cw,
        iface: iface,
    };
}

async function startServer() {
    const isWin = (os.platform() === "win32");
    const proc = spawn(`cd build && ${isWin ? "server.exe" : "./server"} -no_auth -port=auto`, {
        shell: true, stdio: ["pipe", "pipe", "inherit"],
    });
    const port = await new Promise<string>((resolve, reject) => {
        proc.on("exit", () => {
            reject("process failed to start");
        });
        const portFinder = (buf: Buffer) => {
            const data = buf.toString();
            const match = data.match("Listening and serving.*:([0-9]+)");
            if (match) {
                // proc.stdout.on("data", (d) => console.log(d.toString()));
                resolve(match[1]);
            } else {
                proc.stdout.once("data", portFinder);
            }
        }
        proc.stdout.once("data", portFinder)
    })

    return {proc: proc, port: port};
}

describe("Client-Server Integration", () => {
    test("Simple Single Client", async () => {
        const {port, proc} = await startServer();
        const {iface, log, model} = await newClient(port, "AAAA");

        iface.Propose(new InsertTextAction("Hello World!", 0));
        iface.Propose(new InsertTextAction("Good ", 6));

        await new Promise(r => setTimeout(r, 100));

        expect(log.Clock()).toBe(2);
        expect(model.Text).toBe("Hello Good World!");

        proc.kill(9);
    });
    test("Simple Multi Client", async () => {
        const {port, proc} = await startServer();
        const {iface, log, model} = await newClient(port, "AAAA");
        const {iface: iface1, log: log1, model: model1} = await newClient(port, "AAAA");

        expect(iface.Propose(new InsertTextAction("Hello World!", 0))).toBeTruthy();
        await new Promise(r => setTimeout(r, 100));
        expect(iface1.Propose(new InsertTextAction("Good ", 6))).toBeTruthy();
        await new Promise(r => setTimeout(r, 100));

        expect(log.Clock()).toBe(2);
        expect(log1.Clock()).toBe(2);
        expect(model.Text).toBe("Hello Good World!");
        expect(model1.Text).toBe("Hello Good World!");

        proc.kill(9);
    });
});