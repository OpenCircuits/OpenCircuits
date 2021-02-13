const errorOverlayMiddleware = require("react-dev-utils/errorOverlayMiddleware");
const evalSourceMapMiddleware = require("react-dev-utils/evalSourceMapMiddleware");
const redirectServedPath = require("react-dev-utils/redirectServedPathMiddleware");
const noopServiceWorkerMiddleware = require("react-dev-utils/noopServiceWorkerMiddleware");
const ignoredFiles = require("react-dev-utils/ignoredFiles");

const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/sockjs-node'
const sockPort = process.env.WDS_SOCKET_PORT;

module.exports = function(allowedHost, config) {
    const host = process.env.HOST || "localhost";

    return {
        compress: true,

        // Silence regular logs
        //  since we made custom ones
        clientLogLevel: "none",
        quiet: true,

        // Location of html and other assets
        contentBase: config.publicPath,
        contentBasePublicPath: "/",

        // Trigger page reload when assets change
        watchContentBase: true,

        // Hot reloading
        hot: true,

        transportMode: "ws",
        injectClient: false,

        // Enable custom sockjs pathname for websocket connection to hot reloading server.
        // Enable custom sockjs hostname, pathname and port for websocket connection
        // to hot reloading server.
        sockHost,
        sockPath,
        sockPort,

        publicPath: "",

        watchOptions: {
            ignored: ignoredFiles(config.entryPath)
        },

        host,

        overlay: false,

        public: allowedHost,

        before(app, server) {
            app.use(evalSourceMapMiddleware(server));
            app.use(errorOverlayMiddleware());
        },
        after(app) {
            app.use(redirectServedPath("/"));
            app.use(noopServiceWorkerMiddleware("/"));
        }
    }
}