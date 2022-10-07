import fs   from "node:fs";
import path from "node:path";

import bodyParser           from "body-parser";
import Server, {Middleware} from "webpack-dev-server";


/**
 * HOC for dev-server, created by-project so there can be different directories
 *  for digital and analog.
 *
 * @param project The project directory in `.devCache`, i.e. "digital" or "analog".
 * @returns         The Webpack-compatible middleware and dev-server.
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
     * @returns             The passed in middlewares.
     * @throws If one of the underlying functions throws an error.
     */
    return (middlewares: Middleware[], devServer: Server) => {
        if (!devServer.app)
            throw new Error("webpack-dev-server app is not defined");

        // Create new file
        devServer.app.post("/dev/file/:id", bodyParser.text(), (req, res) => {
            // Make cached directory if it doesn't already exist
            if (!fs.existsSync(CACHE_PATH))
                fs.mkdirSync(CACHE_PATH);

            const fileId = req.params.id;
            const file = req.body;

            // Well aware of how unsafe this is, but since it's a DEV only feature
            //  and only runs on the dev's computer, it should be fine
            fs.writeFileSync(path.resolve(CACHE_PATH, fileId), file);

            res.status(200);
        });

        // Get file by ID
        devServer.app.get("/dev/file/:id", (req, res) => {
            const fileId = req.params.id;

            const filePath = path.resolve(CACHE_PATH, fileId);
            if (!fs.existsSync(filePath))
                return res.status(404);

            const data = fs.readFileSync(filePath).toString("utf8");

            res.status(200).send(data);
        });

        // List saved files
        devServer.app.get("/dev/filelist", (req, res) => {
            if (!fs.existsSync(CACHE_PATH))
                return res.status(200).json({ files: [] });

            const files = fs.readdirSync(CACHE_PATH).filter((f) => f.endsWith(".circuit"));

            res.status(200).json({ files });
        });

        return middlewares;
    }
}
