import {rgb} from "d3";

const helpers = {
    hidpiScale(chart) {
        let ratio = devicePixelRatio || 1;
        if (ratio == 1) {
            return;
        }

        let height = chart.canvas.height,
            width = chart.canvas.width;

        chart.canvas.height *= ratio;
        chart.canvas.width *= ratio;

        Object.assign(chart.canvas.style, {
            height: `${height}px`,
            width: `${width}px`,
        });

        chart.ctx.scale(ratio, ratio);
    },

    toRGBA(color, opacity) {
        let c = rgb(color);
        return `rgba(${c.r}, ${c.g}, ${c.b}, ${typeof opacity == "number" ? opacity : 1})`;
    },
};

export default helpers;
