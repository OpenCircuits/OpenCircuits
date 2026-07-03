import path from "node:path";


export default {
    process(sourceText: string, _sourcePath: string, _options: object) {
        return {
            code: `module.exports = \`${Buffer.from(sourceText).toString("base64")}\`;`,
        };
    },
    getCacheKey(_sourceText: string, sourcePath: string, _options: object) {
        return path.basename(sourcePath);
    },
    // Use below when debugging. Jest seems to cache between test runs. Can also clear the cache with --clearCache
    // getCacheKey() {
    //     return "svdsffadsfgTr" + Math.random() + "ansformq" + Math.random();
    // },
};
