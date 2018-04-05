export default function(Chart) {
    Chart.components.register({
        destroy() {
            if (!this.config.events.handleEvent) {
                return;
            }

            ["mousedown", "mouseup", "mouseenter", "mouseleave", "mousemove"].forEach((event) => {
                this.canvas.removeEventListener(event, this.config.events.handleEvent);
            });
        },

        afterDraw() {
            if (!this.config.events.handleEvent) {
                return;
            }

            ["mousedown", "mouseup", "mouseenter", "mouseleave", "mousemove"].forEach((event) => {
                this.canvas.addEventListener(event, this.config.events.handleEvent.bind(this));
            });
        },
    });
}
