const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const config = {
    entry: './site/public/ts/Main.ts',
    output: {
        filename: 'Bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    plugins: [
        new CopyWebpackPlugin([
            {from: 'site/data',       to: 'data'},
            {from: 'site/templates',  to: 'templates'},
            {from: 'site/public/examples',   to: 'examples'},
            {from: 'site/public/img', to: 'img'}
        ])
    ],
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(ts)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'ts-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
};

module.exports = (env, argv) => {
    config.plugins.push(new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(!(argv.mode === 'development'))
    }));

    return config;
};
