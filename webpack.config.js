const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs   = require('fs');

function getItems() {
    var dirs = ['Inputs', 'Outputs', 'Gates', 'FlipFlops'];
    var items = [];
    for (var i = 0; i < dirs.length; i++) {
        var dir = dirs[i].toLowerCase();
        var files = fs.readdirSync('site/public/ts/models/ioobjects/'+dir);
        var imgFiles = fs.readdirSync('site/public/img/icons/'+dir);
        var curItems = [dirs[i]];
        for (var j = 0; j < files.length; j++) {
            var itemName = files[j].substring(0, files[j].lastIndexOf('.'));
            if (files[j].endsWith('.js') && imgFiles.includes(itemName.toLowerCase()+'.svg'))
                curItems.push(itemName);
        }
        items.push(curItems.join('&'));
    }
    return items;
}

var config = {
    entry: './site/public/ts/Main.ts',
    output: {
        filename: 'Bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'site/data', to: 'data' },
            { from: 'site/secrets', to: 'secrets' },
            { from: 'site/templates', to: 'templates' },
            { from: 'site/public/css', to: 'css' },
            { from: 'site/public/img', to: 'img' }
        ])
    ],
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

    config.plugins.push(new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(!(argv.mode === 'development'))
    }));

    return config;
};
