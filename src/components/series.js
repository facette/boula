import * as d3 from "d3";

export default function(Chart) {
    let component = {
        init() {
            Object.assign(this, {
                selectSeries: component._select,
            });
        },

        draw() {
            let area;
            if (this.config.type == "area") {
                area = d3.area()
                    .defined(a => a.y1 !== null)
                    .x(a => this.xScale(a.x))
                    .y0(a => this.yScale(a.y0 || 0))
                    .y1(a => this.yScale(a.y1))
                    .context(this.ctx);
            }

            let line = d3.line()
                .defined(a => a.y1 !== null)
                .x(a => this.xScale(a.x))
                .y(a => this.yScale(a.y1))
                .context(this.ctx);

            let top = this.config.axes.y.max ? this.yScale(this.config.axes.y.max) : 0,
                bottom = (this.config.axes.y.min ? this.yScale(this.config.axes.y.min) : this.area.height) - top;

            this.ctx.save();
            this.ctx.rect(0, top, this.area.width, bottom);
            this.ctx.clip();

            this.data.forEach((datum, idx) => {
                if (this.config.series[idx].disabled) {
                    return;
                }

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
                this.ctx.strokeStyle = this.config.series[idx].color;
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();
            });

            this.ctx.restore();
        },

        _select(idx, toggle = false) {
            if (idx >= this.config.series.length) {
                return;
            }

            if (!toggle) {
                let state = null;
                if (this.config.series.filter(a => !a.disabled).length == 1 && !this.config.series[idx].disabled) {
                    state = false;
                }

                this.config.series.forEach((series, seriesIdx) => {
                    series.disabled = state !== null ? state : seriesIdx !== idx;
                });
            } else {
                this.config.series[idx].disabled = !this.config.series[idx].disabled;
            }

            this.draw();
        },
    };

    Chart.components.register(component);
}
