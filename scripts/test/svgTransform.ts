import path from "path";

const svg = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg>
<svg xmlns="http://www.w3.org/2000/svg" width="500px" height="500px" enable-background="new -250 -250 500 500" viewBox="-250 -250 500 500">
<circle fill="#A63629" cx="0" cy="0" r="225"/>
</svg>
`;

export default {
    process(sourceText: string, sourcePath: string, options: Object) {
        return {
            code: `module.exports = "${Buffer.from(sourceText).toString("base64")}";`,
        };
    },
    getCacheKey(sourceText: string, sourcePath: string, options: Object) {
        return path.basename(sourcePath);
    },
    // Use below when debugging. Jest seems to cache between test runs. Can also clear the cache with --clearCache
    // getCacheKey() {
    //     return "svdsffadsfgTr" + Math.random() + "ansformq" + Math.random();
    // },
};
