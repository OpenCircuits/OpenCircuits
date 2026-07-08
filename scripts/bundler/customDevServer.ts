import fs from "node:fs";
import path from "node:path";

import type { IncomingMessage, ServerResponse } from "node:http";

import bodyParser from "body-parser";
import type { DevServer, DevServerMiddleware } from "@rspack/core";

interface DevRequest extends IncomingMessage {
    body?: string;
    url: string;
    method: string;
}

/**
 * HOC for dev-server, created by-project so there can be different directories
 *  for digital and analog.
 *
 * @param project The project directory in `.devCache`, i.e. "digital" or "analog".
 * @returns       The Bundler-compatible middleware and dev-server.
 */
export default (project: string) => {
    const CACHE_PATH = path.resolve(process.cwd(), ".devCache", project);

    /**
     * Custom dev server middleware for use in issue #1037.
     *
     * Specifically creates a dev API for saving/fetching files.
     *
     * @param middlewares Middlewares to be returned at the end of the funciton.
     * @param devServer   The instance of the development server.
     * @returns           The passed in middlewares.
     * @throws If one of the underlying functions throws an error.
     */
    return (middlewares: DevServerMiddleware[], devServer: DevServer) => {
        if (!devServer.app) throw new Error("dev-server app is not defined");

        // devServer.app in recent Rspack versions is a connect-like instance without .get or .post
        // We cast it to any here solely to access .use since we don't have the internal Rspack router type
        const app = devServer.app as any;

        // List saved files
        app.use("/dev/filelist", (req: DevRequest, res: ServerResponse, next: () => void) => {
            if (req.method !== "GET") return next();
            try {
                if (!fs.existsSync(CACHE_PATH)) {
                    res.setHeader("Content-Type", "application/json");
                    res.statusCode = 200;
                    res.end(JSON.stringify({ files: [] }));
                    return;
                }

                const files = fs.readdirSync(CACHE_PATH).filter((f) => f.endsWith(".circuit"));

                res.setHeader("Content-Type", "application/json");
                res.statusCode = 200;
                res.end(JSON.stringify({ files }));
            } catch (e) {
                res.statusCode = 500;
                res.end(`${e}`);
            }
        });

        // Parse text bodies for /dev/file
        app.use("/dev/file", bodyParser.text());

        // Handle GET and POST for /dev/file/:id
        app.use("/dev/file", (req: DevRequest, res: ServerResponse, next: () => void) => {
            // When using .use("/path"), the internal req.url strips the mounted path.
            // So if requested "/dev/file/123", req.url inside this middleware will be "/123".
            const fileId = req.url?.replace(/^\//, "").split("?")[0];
            if (!fileId) return next();

            if (req.method === "POST") {
                try {
                    // Make cached directory if it doesn't already exist
                    if (!fs.existsSync(CACHE_PATH)) fs.mkdirSync(CACHE_PATH, { recursive: true });

                    const file = req.body || "";

                    // Well aware of how unsafe this is, but since it's a DEV only feature
                    //  and only runs on the dev's computer, it should be fine
                    fs.writeFileSync(path.resolve(CACHE_PATH, fileId), file);

                    res.statusCode = 201;
                    res.end();
                } catch (e) {
                    res.statusCode = 500;
                    res.end(`${e}`);
                }
            } else if (req.method === "GET") {
                try {
                    const filePath = path.resolve(CACHE_PATH, fileId);
                    if (!fs.existsSync(filePath)) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }

                    const data = fs.readFileSync(filePath).toString("utf8");

                    res.statusCode = 200;
                    res.end(data);
                } catch (e) {
                    res.statusCode = 500;
                    res.end(`${e}`);
                }
            } else {
                next();
            }
        });

        return middlewares;
    };
};
