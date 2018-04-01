export default function(Chart) {
    Chart.components.register({
        afterDraw() {
            // Draw X axis
            this.ctx.beginPath();
            this.ctx.font = `${this.config.axes.x.ticks.font.size}px ${this.config.font.family}`;
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = Chart.helpers.toRGBA(this.config.font.color, 0.25);
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "hanging";

            this.xScale.ticks(this.config.axes.x.ticks.count).forEach((tick) => {
                let pos = this.xScale(tick);
                this.ctx.moveTo(pos, this.area.height);
                this.ctx.lineTo(pos, this.area.height + this.config.axes.x.ticks.size);

                this.ctx.fillStyle = this.config.font.color;
                this.ctx.fillText(this.xFormat(tick), pos, this.area.height + this.config.axes.x.ticks.size * 1.35);
            });
            this.ctx.stroke();

            this.ctx.moveTo(0, this.area.height);
            this.ctx.lineTo(this.area.width, this.area.height);
            this.ctx.stroke();

            // Draw Y axis
            if (this.config.axes.y.label.text) {
                this.ctx.save();

                this.ctx.font = `${this.config.axes.y.label.size}px ${this.config.font.family}`;
                this.ctx.fillStyle = Chart.helpers.toRGBA(this.config.font.color, 0.65);
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";

                this.ctx.translate(-this.area.left + this.config.margin, this.area.height / 2);
                this.ctx.rotate(-Math.PI / 2);
                this.ctx.fillText(this.config.axes.y.label.text, 0, 0);

                this.ctx.restore();
            }

            this.ctx.font = `${this.config.axes.y.ticks.font.size}px ${this.config.font.family}`;
            this.ctx.textAlign = "right";
            this.ctx.textBaseline = "middle";

            this.yScale.ticks(this.config.axes.y.ticks.count).forEach((tick) => {
                this.ctx.fillStyle = this.config.font.color;
                this.ctx.fillText(this.yFormat(tick), -this.config.axes.x.ticks.size, this.yScale(tick));
            });
        },
    });
}
