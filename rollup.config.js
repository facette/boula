import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

export default {
    external: [
        "d3",
    ],
    input: "src/index.js",
    output: {
        file: "dist/boula.js",
        format: "umd",
        globals: {
            d3: "d3",
        },
        name: "boula",
    },
    plugins: [
        babel({
            exclude: "node_modules/**",
        }),
        commonjs({
            namedExports: {
                "lodash/merge": ["merge"],
            },
        }),
        resolve(),
    ],
};
