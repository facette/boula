/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {Area, CurveFactory, Line, area, line} from "d3-shape";
import {ScaleLinear, ScaleTime} from "d3-scale";

import {AreaConfig, Chart, ChartType, Component, Config, DataPoint} from "../../../types";

import {toRGBA} from "../../helpers/style";
import Axes from "../axes";
import Base from "../base";

interface Generators {
    left: {
        area?: Area<DataPoint>;
        line?: Line<DataPoint>;
    };
    right: {
        area?: Area<DataPoint>;
        line?: Line<DataPoint>;
    };
}

const types = ["area", "line"];

export default class AreaComponent implements Component {
    private axes!: Axes;

    private base!: Base;

    private chart!: Chart;

    private generators!: Generators;

    public static enabled(config: Config): boolean {
        return (
            types.includes(config.type as string) ||
            config.series.filter(series => types.includes(series.type as string)).length > 0
        );
    }

    constructor(chart: Chart) {
        this.chart = chart;
    }

    public init(): void {
        this.axes = this.chart.components.axes as Axes;
        this.base = this.chart.components.base as Base;
    }

    public beforeDraw(): void {
        this.generators = {
            left: {},
            right: {},
        };

        if (this.axes.state.left && this.chart.config.axes?.y?.left?.draw) {
            this.generators.left = {
                area: this.area(this.axes.scales.x, this.axes.scales.yLeft),
                line: this.line(this.axes.scales.x, this.axes.scales.yLeft),
            };
        }

        if (this.axes.state.right && this.chart.config.axes?.y?.right?.draw) {
            this.generators.right = {
                area: this.area(this.axes.scales.x, this.axes.scales.yRight),
                line: this.line(this.axes.scales.x, this.axes.scales.yRight),
            };
        }
    }

    public draw(): void {
        const ctx = this.chart.ctx;
        const colors = this.chart.config.colors as Array<string>;

        ctx.save();

        ctx.rect(this.base.left, this.base.top - ctx.lineWidth, this.base.width, this.base.height + ctx.lineWidth);
        ctx.clip();

        this.chart.data.forEach((datum, index) => {
            const series = this.chart.config.series[index];
            if (series.disabled) {
                return;
            }

            const type = series.type ?? (this.chart.config.type as ChartType);
            if (!types.includes(type)) {
                return;
            }

            const config = series.area ?? (this.chart.config.area as AreaConfig);
            const color = series.color ?? colors[index % colors.length];
            const axis = series.axis ?? "left";

            if (type === "area" && config.fill) {
                ctx.beginPath();

                if (config.fill === "gradient") {
                    const gradient = ctx.createLinearGradient(0, this.base.top, 0, this.base.top + this.base.height);
                    gradient.addColorStop(0, toRGBA(color, 0.35));
                    gradient.addColorStop(1, toRGBA(color, 0));

                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = toRGBA(color, 0.35);
                }

                let area = this.generators[axis].area;
                if (config.curve !== undefined) {
                    area = area?.curve(config.curve);
                }
                area?.(datum);

                ctx.fill();
            }

            ctx.beginPath();

            Object.assign(ctx, {
                lineWidth: series?.area?.lineWidth ?? this.chart.config.area?.lineWidth,
                strokeStyle: color,
            });

            let line = this.generators[axis].line;
            if (config.curve !== undefined) {
                line = line?.curve(config.curve);
            }

            line?.(datum);
            ctx.stroke();
        });

        ctx.restore();
    }

    private area(xScale: ScaleTime<number, number>, yScale: ScaleLinear<number, number>): Area<DataPoint> {
        return area<DataPoint>()
            .curve(this.chart.config.area?.curve as CurveFactory)
            .defined(point => point.y1 !== null && !isNaN(point.y1))
            .x(point => xScale(point.x))
            .y0(point => yScale(point.y0 || 0))
            .y1(point => yScale(point.y1 || 0))
            .context(this.chart.ctx);
    }

    private line(xScale: ScaleTime<number, number>, yScale: ScaleLinear<number, number>): Line<DataPoint> {
        return line<DataPoint>()
            .curve(this.chart.config.area?.curve as CurveFactory)
            .defined(point => point.y1 !== null && !isNaN(point.y1))
            .x(point => xScale(point.x))
            .y(point => yScale(point.y1 || 0))
            .context(this.chart.ctx);
    }
}
