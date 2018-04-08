import * as d3 from "d3";

export default function(Chart) {
    let component = {
        layout() {
            this.yScale = d3.scaleLinear()
                .domain(component._getDomain.call(this, "y", "y1"))
                .range([this.area.height, 0])
                .nice();

            this.yFormat = this.config.axes.y.stack == "percent" ? d3.format(".0%") : this.config.axes.y.ticks.format;

            // Adapt area width to Y axis labels
            this.ctx.font = `${this.config.axes.y.ticks.font.size}px ${this.config.font.family}`;
            this.area.width -= Math.max(...this.yScale.ticks(this.config.axes.y.ticks.count)
                .map(a => this.ctx.measureText(this.yFormat(a)).width));

            this.xScale = d3.scaleTime()
                .domain(component._getDomain.call(this, "x", "x"))
                .range([0, this.area.width]);

            this.xFormat = (date) => {
                return (
                    d3.timeSecond(date) < date ? d3.timeFormat(".%L") :
                    d3.timeMinute(date) < date ? d3.timeFormat(":%S") :
                    d3.timeHour(date) < date ? d3.timeFormat("%H:%M") :
                    d3.timeDay(date) < date ? d3.timeFormat("%H:00") :
                    d3.timeMonth(date) < date ? d3.timeFormat("%a %d") :
                    d3.timeYear(date) < date ? d3.timeFormat("%B") :
                    d3.timeFormat("%Y")
                )(date);
            };
        },

        _getDomain(axis, key) {
            let min,
                max;

            if (this.config.axes[axis].min !== null) {
                min = this.config.axes[axis].min;
            } else {
                min = d3.min(this.data, a => d3.min(a, b => b[key]));
            }

            if (this.config.axes[axis].max !== null) {
                max = this.config.axes[axis].max;
            } else {
                max = d3.max(this.data, a => d3.max(a, b => b[key]));
            }

            if (axis == "y") {
                // Start Y axis at zero
                if (min > 0) {
                    min = 0;
                }

                // Center Y axis zero if negative values are present
                else if (this.config.axes.y.center && min < 0) {
                    max = Math.max(max, Math.abs(min));
                    min = max * -1;
                }
            }

            return [min || 0, max || 1];
        },
    };

    Chart.components.register(component);
}
