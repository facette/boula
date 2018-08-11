import * as d3 from "d3";

export default function(Chart) {
    Chart.components.register({
        init() {
            Object.assign(this, {
                highlightSeries(idx, state) {
                    this.config.series.forEach((series, i) => {
                        series.fade = i !== idx ? state : false;
                    });

                    this._highlight = state;
                    this.draw();
                },
            });
        },

        draw() {
            let area;
            if (this.config.type == "area") {
                area = d3.area()
                    .x(a => this.xScale(a.x))
                    .y0(a => this.yScale(a.y0 || 0))
                    .y1(a => this.yScale(a.y1))
                    .context(this.ctx);
            }

            let line = d3.line()
                .x(a => this.xScale(a.x))
                .y(a => this.yScale(a.y1))
                .context(this.ctx);

            let top = this.config.axes.y.max ? this.yScale(this.config.axes.y.max) : 0,
                bottom = (this.config.axes.y.min ? this.yScale(this.config.axes.y.min) : this.area.height) - top;

            this.ctx.save();
            this.ctx.rect(0, top, this.area.width, bottom);
            this.ctx.clip();

            this.data.forEach((datum, idx) => {
                let fade = typeof this.config.series[idx].fade == "boolean" ? this.config.series[idx].fade : false;

                if (!this.config.series[idx].color) {
                    this.config.series[idx].color = this.config.colors[idx % this.config.colors.length];
                }

                if (this.config.type == "area" && !this._highlight) {
                    this.ctx.beginPath();
                    area(datum);
                    this.ctx.fillStyle = Chart.helpers.toRGBA(this.config.series[idx].color, 0.65);
                    this.ctx.fill();
                }

                this.ctx.beginPath();
                line(datum);
                this.ctx.strokeStyle = Chart.helpers.toRGBA(this.config.series[idx].color, fade ? 0.1 : 1);
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();
            });

            this.ctx.restore();
        },
    });
}
