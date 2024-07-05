import path from 'path';
import CopyPlugin from "copy-webpack-plugin";
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export default {
    entry: {
        demo: './demo/demo.js'
    },
    output: {
        path: path.resolve(__dirname, './demoDist'),

    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: 'demo/index.html', to: 'index.html'},
            ],
        }),
    ]
}
