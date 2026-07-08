import fs from "node:fs";
import path from "node:path";

import bodyParser from "body-parser";
import type { DevServer, DevServerMiddleware } from "@rspack/core";
import type { Application, Request, Response } from "express";

/**
 * HOC for dev-server, created by-project so there can be different directories
 *  for digital and analog.
 *
 * @param project The project directory in `.devCache`, i.e. "digital" or "analog".
 * @returns       The Webpack-compatible middleware and dev-server.
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
        if (!devServer.app) throw new Error("webpack-dev-server app is not defined");

        // devServer.app in @rspack/dev-server is an Express instance at runtime
        const app = devServer.app as unknown as Application;

        // Create new file
        app.post("/dev/file/:id", bodyParser.text(), (req: Request, res: Response) => {
            try {
                // Make cached directory if it doesn't already exist
                if (!fs.existsSync(CACHE_PATH)) fs.mkdirSync(CACHE_PATH, { recursive: true });

                const fileId = req.params.id;
                const file = req.body as string;

                // Well aware of how unsafe this is, but since it's a DEV only feature
                //  and only runs on the dev's computer, it should be fine
                fs.writeFileSync(path.resolve(CACHE_PATH, fileId), file);

                res.status(201).send();
            } catch (e) {
                res.status(500).send(`${e}`);
            }
        });

        // Get file by ID
        app.get("/dev/file/:id", (req: Request, res: Response) => {
            try {
                const fileId = req.params.id;

                const filePath = path.resolve(CACHE_PATH, fileId);
                if (!fs.existsSync(filePath)) {
                    res.status(404).send();
                    return;
                }

                const data = fs.readFileSync(filePath).toString("utf8");

                res.status(200).send(data);
            } catch (e) {
                res.status(500).send(`${e}`);
            }
        });

        // List saved files
        app.get("/dev/filelist", (req: Request, res: Response) => {
            try {
                if (!fs.existsSync(CACHE_PATH)) {
                    res.status(200).json({ files: [] });
                    return;
                }

                const files = fs.readdirSync(CACHE_PATH).filter((f) => f.endsWith(".circuit"));

                res.status(200).json({ files });
            } catch (e) {
                res.status(500).send(`${e}`);
            }
        });

        return middlewares;
    };
};
