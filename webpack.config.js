const path = require('path');

var config = {
    entry: './site/public/ts/Main.ts',
    output: {
        filename: 'Bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    devtool: 'source-map',
    module: {
        rules: [ {
            test: /\.tsx?$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'ts-loader'
            }
        } ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    }
};

module.exports = (env, argv) => {

    if (argv.mode === 'development') {
        // do some different stuff maybe
    }

    return config;
};
