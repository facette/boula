export default function(Chart) {
    Chart.components.register({
        layout() {
            let heightDelta = 0;

            if (this.config.titles.main.text) {
                heightDelta += this.config.titles.main.size;
            }

            if (this.config.titles.subtitle.text) {
                heightDelta += this.config.titles.subtitle.size;
            }

            if (heightDelta > 0) {
                this.area.height -= heightDelta + this.config.margin * 0.5;
                this.yScale.range([this.area.height, 0]);
            }
        },

        draw() {
            if (!this.config.titles.main.text && !this.config.titles.subtitle.text) {
                return;
            }

            let top = this.config.margin * -1.5,
                delta = 0;

            this.ctx.save();
            this.ctx.textAlign = "center";

            if (this.config.titles.main.text) {
                this.ctx.font = `${this.config.titles.main.size}px ${this.config.font.family}`;
                this.ctx.fillStyle = this.config.font.color;
                this.ctx.fillText(this.config.titles.main.text, this.area.width / 2, top);

                delta += this.config.titles.main.size + this.config.margin * 0.125;
            }

            if (this.config.titles.subtitle.text) {
                this.ctx.font = `${this.config.titles.subtitle.size}px ${this.config.font.family}`;
                this.ctx.fillStyle = Chart.helpers.toRGBA(this.config.font.color, 0.5);
                this.ctx.fillText(this.config.titles.subtitle.text, this.area.width / 2, top + delta);
            }

            this.ctx.restore();
        },
    });
}
