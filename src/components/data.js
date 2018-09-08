import * as d3 from "d3";

export default function(Chart) {
    Chart.components.register({
        update() {
            switch (this.config.axes.y.stack) {
            case "normal":
            case "percent": {
                let data = {},
                    keys = [];

                this.config.series.forEach((series) => {
                    if (series.points) {
                        series.points.forEach((point) => {
                            if (series.disabled) {
                                return;
                            }

                            let date = point[0] * 1000;
                            if (!data[date]) {
                                data[date] = {date: date};
                            }

                            data[date][series.name] = point[1];
                        });
                    }

                    keys.push(series.name);
                });

                if (this.config.axes.y.stack == "percent") {
                    // TODO: reimplement percent
                }

                let stack = d3.stack()
                    .keys(keys)
                    .order(d3.stackOrderReverse);

                this.data = stack(Object.values(data)).map((series) => {
                    return series.map(a => ({x: a.data.date, y0: a[0], y1: a[1]}));
                });

                break;
            }

            default:
                this.data = this.config.series.map((series) => {
                    return series.points ? series.points.map(a => ({x: a[0] * 1000, y1: a[1]})) : [];
                });
            }
        },
    });
}
