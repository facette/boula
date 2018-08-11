export default function(Chart) {
    let component = {
        init() {
            Object.assign(this, {
                addLine: component._add,
                removeLine: component._remove,
            });
        },

        afterDraw() {
            this.ctx.save();
            this.ctx.font = `${this.config.axes.y.ticks.font.size - 2}px ${this.config.font.family}`;
            this.ctx.textAlign = "right";
            this.ctx.textBaseline = "middle";

            this.config.axes.y.lines.forEach((line) => {
                let pos = this.yScale(line.y),
                    xDelta = 0;

                if (!line.color) {
                    line.color = this.config.font.color;
                }

                if (line.label) {
                    let text = typeof line.label == "boolean" ? this.yFormat(line.y) : line.label,
                        measure = this.ctx.measureText(text);

                    let yDelta = 6,
                        yDeltaLow = Math.round(yDelta / 3),
                        yDeltaMedium = Math.round(yDelta * 2 / 3),
                        yStart = -this.config.axes.x.ticks.size - measure.width;

                    this.ctx.save();

                    xDelta = Math.abs(yStart) - this.area.left + this.config.margin / 2;
                    if (xDelta > 0) {
                        this.ctx.translate(xDelta, 0);
                    }

                    this.ctx.fillStyle = line.color;

                    // Draw label background
                    this.ctx.beginPath();
                    this.ctx.moveTo(yStart, pos - yDelta);
                    this.ctx.lineTo(-this.config.axes.x.ticks.size, pos - yDelta);
                    this.ctx.quadraticCurveTo(-yDeltaMedium, pos - yDelta, 0, pos);
                    this.ctx.quadraticCurveTo(-yDeltaMedium, pos + yDelta, -this.config.axes.x.ticks.size,
                        pos + yDelta);
                    this.ctx.lineTo(yStart, pos + yDelta);
                    this.ctx.quadraticCurveTo(yStart - yDeltaLow, pos + yDelta, yStart - yDeltaLow,
                        pos + yDeltaMedium);
                    this.ctx.lineTo(yStart - yDeltaLow, pos - yDeltaMedium);
                    this.ctx.quadraticCurveTo(yStart - yDeltaLow, pos - yDelta, yStart, pos - yDelta);
                    this.ctx.closePath();
                    this.ctx.fill();

                    // Draw text on label
                    this.ctx.fillStyle = Chart.helpers.toRGBA(this.config.background.color, 0.8);
                    this.ctx.fillText(text, -this.config.axes.x.ticks.size, pos);

                    this.ctx.restore();
                }

                // Draw line
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = line.color;

                this.ctx.beginPath();
                if (line.dashed) {
                    this.ctx.setLineDash([4, 4]);
                }
                this.ctx.moveTo(xDelta > 0 ? xDelta : 0, pos);
                this.ctx.lineTo(this.area.width, pos);
                this.ctx.stroke();
            });

            this.ctx.restore();
        },

        _add(id, line) {
            this.config.axes.y.lines.push(Object.assign(line, {id}));
            this.draw();
        },

        _remove(id) {
            let length = this.config.axes.y.lines.length;

            this.config.axes.y.lines = this.config.axes.y.lines.filter(a => a.id !== id);

            if (this.config.axes.y.lines.length !== length) {
                this.draw();
            }
        },
    };

    Chart.components.register(component);
}
