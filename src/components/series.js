import * as d3 from "d3";

export default function(Chart) {
    Chart.components.register({
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

            this.ctx.save();
            this.ctx.rect(0, 0, this.area.width, this.area.height);
            this.ctx.clip();

            this.data.forEach((datum, idx) => {
                if (!this.config.series[idx].color) {
                    this.config.series[idx].color = this.config.colors[idx % this.config.colors.length];
                }

                if (this.config.type == "area") {
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
    });
}
