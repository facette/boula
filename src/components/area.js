export default function(Chart) {
    Chart.components.register({
        layout() {
            // Clear canvas
            this.ctx.fillStyle = this.config.background.color;
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.rect(0, 0, this.width, this.height);
            this.ctx.fill();

            // Set base area position
            this.area = {
                left: this.config.margin,
                top: this.config.margin,
                height: this.height - 2 * this.config.margin,
                width: this.width - 2 * this.config.margin,
            };

            if (this.config.axes.y.label.text) {
                this.area.left += this.config.margin;
                this.area.width -= this.config.margin;
            }
        },

        beforeDraw() {
            Object.assign(this.area, {
                left: this.width - this.area.width - this.config.margin,
                top: this.height - this.area.height - this.config.margin,
            });

            this.ctx.translate(this.area.left, this.area.top);
        },

        draw() {
            // Draw Y grid
            let ticks = this.yScale.ticks(this.config.axes.y.ticks.count);

            this.ctx.beginPath();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = Chart.helpers.toRGBA(this.config.font.color, 0.1);

            ticks.forEach((tick) => {
                let pos = this.yScale(tick);
                this.ctx.moveTo(0, pos);
                this.ctx.lineTo(this.area.width, pos);
            });

            this.ctx.stroke();
        },
    });
}
