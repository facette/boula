import {defaultConfig} from "./config";
import * as d3 from "d3";
import merge from "lodash/merge";

function Chart(config) {
    Chart.components.execute.call(this, "init");
    this.update(config);
    return this;
}

Object.assign(Chart.prototype, {
    destroy() {
        Chart.components.execute.call(this, "destroy");
    },

    draw() {
        this.ctx.save();

        [
            "update",
            "layout",
            "beforeDraw",
            "draw",
            "afterDraw",
        ].forEach(step => Chart.components.execute.call(this, step));

        this.ctx.restore();

        if (this.config.events.afterDraw) {
            this.config.events.afterDraw();
        }
    },

    update(config) {
        this.config = merge({}, defaultConfig, config);

        // Get defaults from body style
        let style = getComputedStyle(document.body);

        if (this.config.background.color === null) {
            this.config.background.color = style.backgroundColor;
        }

        if (this.config.font.color === null) {
            this.config.font.color = style.color;
        }

        if (this.config.font.family === null) {
            this.config.font.family = style.fontFamily;
        }

        // Initialize canvas
        this.height = this.config.bindTo.parentNode.clientHeight;
        this.width = this.config.bindTo.parentNode.clientWidth;

        this.canvas = d3.select(this.config.bindTo)
            .attr("height", this.height)
            .attr("width", this.width)
            .node();

        this.ctx = this.canvas.getContext("2d");

        // Handle HiDPI display
        Chart.helpers.hidpiScale(this);
    },
});

export default Chart;
