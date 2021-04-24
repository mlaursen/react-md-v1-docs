/* eslint-disable no-unused-vars */
const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const winston = require('winston');
const { name, homepage } = require('./package.json');

dotenv.config();
const src = path.resolve(__dirname, 'src');
const modules = path.resolve(__dirname, 'node_modules');
const clientEntry = path.join(src, 'client', 'index.jsx');
const clientDist = path.resolve(__dirname, 'public');
const POLL_ENTRY = 'webpack/hot/poll?1000';
const PRODUCTION_SUFFIX = '.[chunkhash:8].min';
const DEV_PLUGINS = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
];
const PROD_PLUGINS = [];
const CLIENT_DEV_PLUGINS = [];
const CLIENT_PROD_PLUGINS = [
  new webpack.optimize.UglifyJsPlugin({
    beautify: false,
    mangle: {
      screw_ie8: true,
      keep_fnames: true,
    },
    compress: {
      screw_ie8: true,
      warnings: false,
    },
    comments: false,
    sourceMap: true,
  }),
  new ManifestPlugin(),
  new webpack.HashedModuleIdsPlugin(),
  new webpack.optimize.CommonsChunkPlugin({
    name: ['chunks', 'manifest'],
    minChunks: Infinity,
  }),
];

const analytics = `
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)'
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-76079335-1', 'auto');
ga('send', 'pageview');
</script>
`;

module.exports = ({ production }) => {
  // let publicUrl = process.env.PUBLIC_URL;
  // if (!publicUrl) {
  //   publicUrl = production ? homepage : 'http://localhost';
  //   winston.info(`The \`PUBLIC_URL\` environment variable was not set. Defaulting to \`${publicUrl}\`.`);
  // }

  // if (!publicUrl.match(/^https?:\/\//)) {
  //   winston.info('Updating the `PUBLIC_URL` environment variable to be prefixed with `http://` since the protocol was missing.');
  //   winston.info('Please update the `PUBLIC_URL` environment variable with a valid protocol if this is not desired.');
  //   publicUrl = `http://${publicUrl}`;
  // }

  // const withoutOrigin = publicUrl.replace(/https?:\/\//, '');
  // const pathIndex = withoutOrigin.indexOf('/');
  // const rootPath = pathIndex === -1 ? '/' : `${withoutOrigin.substring(pathIndex)}/`.replace(/\/+/g, '/');

  // let publicPath = `${publicUrl}/`;
  // if (!production) {
  //   publicPath = `${publicUrl}:3000/`;
  // }
  const publicPath = production ? '/react-md-v1-docs/' : '/';

  let entry;
  let target;
  let externals;
  const babelPlugins = [];
  const additionalPlugins = [];
  const additionalLoaders = [];
  const extractStyles = new ExtractTextPlugin({
    filename: `styles${PRODUCTION_SUFFIX}.css`,
    allChunks: true,
    disable: !production,
  });
  const dist = clientDist;
  entry = clientEntry;
  if (!production) {
    entry = [
      // `webpack-dev-server/client?${publicPath}`,
      'webpack/hot/only-dev-server',
      entry,
    ];
  }
  const filename = `[name]${production ? PRODUCTION_SUFFIX : ''}.js`;
  const chunkFilename = `[name]${production ? PRODUCTION_SUFFIX : ''}.js`;
  const browserTargets = ['last 2 versions', 'safari >= 7'];
  additionalPlugins.push(
    extractStyles,
    new AssetsPlugin(),
    new OptimizeCssAssetsPlugin(),
    ...(production ? CLIENT_PROD_PLUGINS : CLIENT_DEV_PLUGINS)
  );
  additionalLoaders.push({
    // Loading css dependencies from dependencies (normalize.css and Prism.css)
    test: /\.css$/,
    loader: extractStyles.extract({
      use: [{
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 1,
        },
      }, {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        },
      }],
      fallback: 'style-loader',
    }),
  }, {
    test: /\.scss$/,
    include: src,
    loader: extractStyles.extract({
      use: [{
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 2,
        },
      }, {
        loader: 'postcss-loader',
        options: {
          sourceMap: true,
        },
      }, {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          outputStyle: !production ? 'expanded' : 'compressed',
        },
      }],
      fallback: 'style-loader',
    }),
  });
  const devServer = {
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    clientLogLevel: 'error',
  };

  if (!production) {
    babelPlugins.push('transform-react-jsx-source');
  }

  const envPresetTargets = {};
  if (browserTargets) {
    envPresetTargets.browsers = browserTargets;
  }

  const routesName = production ? 'async' : 'sync';

  // winston.info(`Starting compliation with:
// - \`rootPath\` = \`${rootPath}\`
// - \`publicUrl\` = \`${publicUrl}\`
// - \`publicPath\` = \`${publicPath}\`

  // `);
  return {
    bail: production,
    cache: !production,
    devtool: production ? 'source-map' : 'cheap-module-eval-source-map',
    devServer: !production ? devServer : undefined,
    entry,
    target,
    externals,
    output: {
      path: dist,
      publicPath,
      filename,
      chunkFilename,
    },
    module: {
      rules: [{
        enforce: 'pre',
        test: /\.jsx?$/,
        include: src,
        loader: 'eslint-loader',
      }, {
        test: /\.jsx?$/,
        include: src,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['env', {
              targets: envPresetTargets,
              modules: false,
              loose: true,
            }],
            'react',
            'stage-0',
          ],
          plugins: [
            ...babelPlugins,
            'transform-decorators-legacy',
            'lodash',
          ],
        },
      }, {
        test: /\.md$/,
        include: src,
        loader: 'raw-loader',
      }, {
        test: /\.json$/,
        include: src,
        loader: 'json-loader',
      }, {
        test: /\.(woff2?|ttf|eot)$/,
        include: src,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10240,
          },
        }],
      }, {
        test: /\.svg$/,
        include: path.join(src, 'icons'),
        use: [{
          loader: 'svg-sprite-loader',
          options: {
            extract: true,
            spriteFilename: `icon-sprites${production ? '.[hash:8]' : ''}.svg`,
          },
        }, {
          loader: 'svgo-loader',
        }],
      }, {
        test: /\.(png|jpe?g|gif|svg)/,
        include: src,
        exclude: /icons/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10240,
          },
        }, {
          loader: 'image-webpack-loader',
          options: {
            bypassOnDebug: true,
          },
        }],
      }, ...additionalLoaders],
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/^routes$/, `routes/${routesName}.js`),
      new webpack.NormalModuleReplacementPlugin(/^\.\/routes$/, `./${routesName}.js`),
      new HtmlWebpackPlugin({
        template: path.join('src', 'template.html'),
        filename: 'index.html',
        inject: true,
        analytics: production ? analytics : '',
        publicPath,
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          eslint: {
            failOnError: true,
          },
          debug: !production,
        },
      }),
      new webpack.DefinePlugin({
        PUBLIC_URL: JSON.stringify(publicPath),
        __NGINX__: !!process.env.USE_NGINX,
        __DEV__: !production,
        __TEST__: false,
        __CLIENT__: true,
        __SSR__: false,
        'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
        'process.env.ROOT_PATH': JSON.stringify(publicPath),
      }),
      new SpriteLoaderPlugin(),
      ...additionalPlugins,
      ...(production ? PROD_PLUGINS : DEV_PLUGINS),
    ],
    resolve: {
      alias: {
        'globals': path.join(src, '_globals.scss'),
        'react-md': path.resolve(__dirname, '..'),
        'react': path.join(modules, 'react'),
        'react-dom': path.join(modules, 'react-dom'),
      },
      extensions: ['.js', '.jsx'],

      // resolve dependencies first and then files in src. Allows for
      // import Something from 'components/Something' instead of '../../../../compoennts/Something'
      modules: ['node_modules', 'src'],
    },
    stats: 'errors-only',
  };
};
