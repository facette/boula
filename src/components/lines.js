export default function(Chart) {
    Chart.components.register({
        afterDraw() {
            this.ctx.save();
            this.ctx.font = `${this.config.axes.y.ticks.font.size - 2}px ${this.config.font.family}`;
            this.ctx.textAlign = "right";
            this.ctx.textBaseline = "middle";

            this.config.axes.y.lines.forEach((line) => {
                let pos = this.yScale(line.y);

                if (line.label) {
                    let text = this.yFormat(line.y),
                        measure = this.ctx.measureText(text);

                    let delta = 6,
                        deltaLow = Math.round(delta / 3),
                        deltaMedium = Math.round(delta * 2 / 3),
                        yStart = -this.config.axes.x.ticks.size - measure.width;

                    this.ctx.fillStyle = line.color || this.config.font.color;

                    // Draw label background
                    this.ctx.beginPath();
                    this.ctx.moveTo(yStart, pos - delta);
                    this.ctx.lineTo(-this.config.axes.x.ticks.size, pos - delta);
                    this.ctx.quadraticCurveTo(-deltaMedium, pos - delta, 0, pos);
                    this.ctx.quadraticCurveTo(-deltaMedium, pos + delta, -this.config.axes.x.ticks.size, pos + delta);
                    this.ctx.lineTo(yStart, pos + delta);
                    this.ctx.quadraticCurveTo(yStart - deltaLow, pos + delta, yStart - deltaLow, pos + deltaMedium);
                    this.ctx.lineTo(yStart - deltaLow, pos - deltaMedium);
                    this.ctx.quadraticCurveTo(yStart - deltaLow, pos - delta, yStart, pos - delta);
                    this.ctx.closePath();
                    this.ctx.fill();

                    // Draw text on label
                    this.ctx.fillStyle = Chart.helpers.toRGBA(this.config.background.color, 0.8);
                    this.ctx.fillText(text, -this.config.axes.x.ticks.size, pos);
                }

                // Draw line
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = line.color || Chart.helpers.toRGBA(this.config.font.color, 0.1);

                this.ctx.beginPath();
                if (line.dashed) {
                    this.ctx.setLineDash([4, 4]);
                }
                this.ctx.moveTo(0, pos);
                this.ctx.lineTo(this.area.width, pos);
                this.ctx.stroke();
            });

            this.ctx.restore();
        },
    });
}
