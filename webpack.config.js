const path = require('path');

var config = {
    entry: './refactor/public/js/Main.js',
    output: {
        filename: 'Bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    devtool: 'source-map',
    module: {
        rules: [ {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-flow']
                }
            }
        } ]
    }
};

module.exports = (env, argv) => {

    if (argv.mode === 'development') {
        // do some different stuff maybe
    }

    return config;
};
