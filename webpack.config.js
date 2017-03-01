var webpack = require('webpack');

module.exports = {
	entry: './site/scripts/main.js',
	output: {
		filename: '[name].js',
		path: __dirname + '/.tmp'
	},
	devtool: 'source-map',
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel-loader'
		}]
	},
	plugins: [],
	eslint: {
		configFile: __dirname + '/.eslintrc'
	}
};
