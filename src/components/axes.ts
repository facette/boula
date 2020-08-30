/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {max, min} from "d3-array";
import {format} from "d3-format";
import {ScaleLinear, ScaleTime, scaleLinear, scaleTime} from "d3-scale";

import {Axis, DataPoint, Formatter, XAxis, YAxis} from "../../types";

import Component from "../component";
import {measureText} from "../helpers/canvas";
import {applyFontSize, toRGBA} from "../helpers/style";
import Base from "./base";

interface Formatters {
    x: Formatter<Date>;
    yLeft: Formatter<number | null>;
    yRight: Formatter<number | null>;
}

interface Scales {
    x: ScaleTime<number, number>;
    yLeft: ScaleLinear<number, number>;
    yRight: ScaleLinear<number, number>;
}

interface TickWidths {
    left: number;
    right: number;
}

interface AxesState {
    left?: boolean;
    right?: boolean;
}

export default class AxesComponent extends Component {
    public formatters!: Formatters;

    public scales!: Scales;

    public state!: AxesState;

    public ticksWidth: TickWidths = {
        left: 0,
        right: 0,
    };

    private base!: Base;

    private font!: string;

    public init(): void {
        this.base = this.chart.components.base as Base;
    }

    public beforeDraw(): void {
        this.font = applyFontSize(this.chart.ctx, Math.round((this.chart.config.font?.size as number) * 0.85));

        this.formatters = {
            x: this.chart.config.axes?.x?.ticks?.format as Formatter<Date>,
            yLeft: (this.chart.config.axes?.y?.stack === "percent"
                ? format(".0%")
                : this.chart.config.axes?.y?.left?.ticks?.format) as Formatter<number | null>,
            yRight: (this.chart.config.axes?.y?.stack === "percent"
                ? format(".0%")
                : this.chart.config.axes?.y?.right?.ticks?.format) as Formatter<number | null>,
        };

        // Remove X axis height from base if axis to be drawn. It needs to be
        // applied first as it'll impact Y left/right scale ranges.
        if (this.chart.config.axes?.x?.draw) {
            this.base.height -=
                measureText(this.chart.ctx, "M", this.font).height +
                (this.chart.config.axes.x.ticks?.size as number) +
                (this.chart.config.axes.x.ticks?.margin as number);
        }

        // Loop through series to detect if Y axes are needed based on series
        // state.
        this.state = this.chart.config.series.reduce((axes, series) => {
            const axis = series.axis ?? "left";
            axes[axis] = axes[axis] !== true && series.disabled ? false : true;
            return axes;
        }, {} as AxesState);

        // Initialize scale and update base layout according for each axis. The
        // order here matter as base layout updates will impact next scales
        // domains.
        const yLeft = scaleLinear()
            .domain(this.domain(this.chart.config.axes?.y?.left as Axis, "y1", "left"))
            .range([this.base.top + this.base.height, this.base.top])
            .nice();

        if (this.state.left !== undefined && this.chart.config.axes?.y?.left?.draw) {
            this.updateBase(this.chart.config.axes.y.left, yLeft, this.formatters.yLeft, "left");
        }

        const yRight = scaleLinear()
            .domain(this.domain(this.chart.config.axes?.y?.right as Axis, "y1", "right"))
            .range([this.base.top + this.base.height, this.base.top])
            .nice();

        if (this.state.right !== undefined && this.chart.config.axes?.y?.right?.draw) {
            this.updateBase(this.chart.config.axes.y.right, yRight, this.formatters.yRight, "right");
        }

        const x = scaleTime()
            .domain(this.domain(this.chart.config.axes?.x as Axis, "x"))
            .range([this.base.left, this.base.left + this.base.width]);

        this.scales = {x, yLeft, yRight};
    }

    public draw(): void {
        const ctx = this.chart.ctx;
        const fontColor = this.chart.config.font?.color as string;

        ctx.save();
        ctx.beginPath();

        Object.assign(ctx, {
            fillStyle: fontColor,
            font: this.font,
            lineWidth: 1,
            strokeStyle: toRGBA(fontColor, 0.35),
        });

        // Trace axes based on current configuration, then call "stroke"
        // to trace all ticks at once (path may be empty if none of the ticks
        // are to be drawn).
        if (this.chart.config.axes?.x?.draw) {
            this.drawXAxis(this.chart.config.axes.x, this.scales.x, this.formatters.x);
        }
        if (this.state.left && this.chart.config.axes?.y?.left?.draw) {
            this.drawYAxis(this.chart.config.axes?.y?.left, this.scales.yLeft, this.formatters.yLeft, "left");
        }
        if (this.state.right && this.chart.config.axes?.y?.right?.draw) {
            this.drawYAxis(this.chart.config.axes?.y?.right, this.scales.yRight, this.formatters.yRight, "right");
        }

        ctx.stroke();
        ctx.restore();
    }

    private domain(axis: Axis, key: "x" | "y0" | "y1", side?: "left" | "right"): [number, number] {
        let min = axis?.min;
        if (min === undefined) {
            min = this.valueFromData("min", key, side);
        }

        let max = axis?.max;
        if (max === undefined) {
            max = this.valueFromData("max", key, side);
        }

        if (side !== undefined && this.chart.config.axes?.y?.center) {
            max = Math.max(max, Math.abs(min));
            min = max * -1;
        }

        return [min, max];
    }

    private drawXAxis(axis: XAxis, scale: ScaleTime<number, number>, format: Formatter<Date>): void {
        const ctx = this.chart.ctx;
        const draw = axis?.ticks?.draw as boolean;
        const tickMargin = axis?.ticks?.margin as number;
        const tickSize = axis?.ticks?.size as number;
        const y = this.base.top + this.base.height;

        ctx.save();

        Object.assign(ctx, {
            textAlign: "center",
            textBaseline: "top",
        });

        scale.ticks(axis?.ticks?.count as number).forEach(tick => {
            const pos = scale(tick);
            if (draw) {
                ctx.moveTo(pos, y);
                ctx.lineTo(pos, y + tickSize);
            }
            ctx.fillText(format(tick), pos, y + tickSize + tickMargin);
        });

        ctx.restore();

        if (draw) {
            ctx.moveTo(this.base.left, y);
            ctx.lineTo(this.base.left + this.base.width, y);
        }
    }

    private drawYAxis(
        axis: YAxis,
        scale: ScaleLinear<number, number>,
        format: Formatter<number | null>,
        side: "left" | "right",
    ): void {
        const ctx = this.chart.ctx;
        const draw = axis?.ticks?.draw as boolean;
        const fontColor = this.chart.config.font?.color as string;
        const margin = this.chart.config.margin as number;
        const tickMargin = axis?.ticks?.margin as number;
        const tickSize = axis?.ticks?.size as number;

        if (axis?.label?.text) {
            ctx.save();

            Object.assign(ctx, {
                fillStyle: toRGBA(fontColor, 0.5),
                textAlign: "center",
                textBaseline: "top",
            });

            if (side === "left") {
                ctx.translate(margin, this.base.top + this.base.height / 2);
                ctx.rotate(-Math.PI / 2);
            } else {
                ctx.translate(this.chart.width - margin, this.base.top + this.base.height / 2);
                ctx.rotate(Math.PI / 2);
            }

            ctx.fillText(axis.label.text, 0, 0);
            ctx.restore();
        }

        let x = this.base.left;
        if (side === "right") {
            x += this.base.width;
        }

        ctx.save();
        ctx.textBaseline = "middle";

        scale.ticks(axis?.ticks?.count).forEach(tick => {
            const pos = scale(tick);

            if (side === "left") {
                ctx.textAlign = "right";
                if (draw) {
                    ctx.moveTo(x, pos);
                    ctx.lineTo(x - tickSize, pos);
                }
                ctx.fillText(format(tick), x - tickSize - tickMargin, pos);
            } else {
                ctx.textAlign = "left";
                if (draw) {
                    ctx.moveTo(x, pos);
                    ctx.lineTo(x + tickSize, pos);
                }
                ctx.fillText(format(tick), x + tickSize + tickMargin, pos);
            }
        });

        if (draw) {
            ctx.moveTo(x, this.base.top);
            ctx.lineTo(x, this.base.top + this.base.height);
        }

        ctx.restore();
    }

    private updateBase(
        axis: YAxis,
        scale: ScaleLinear<number, number>,
        format: Formatter<number | null>,
        side: "left" | "right",
    ): void {
        const ctx = this.chart.ctx;
        let xDelta: number;

        if (this.state[side]) {
            xDelta =
                Math.max(
                    ...scale.ticks(axis.ticks?.count).map(value => measureText(ctx, format(value), this.font).width),
                ) +
                (axis.ticks?.margin as number) +
                (axis.ticks?.size as number);

            this.ticksWidth[side] = xDelta;
        } else {
            // Side is disabled to to series filtering, thus restore previous
            // delta from stored state.
            xDelta = this.ticksWidth[side];
        }

        if (axis.label?.text) {
            xDelta += measureText(ctx, axis.label.text, this.font).height + (axis.label?.margin as number);
        }

        if (side === "left") {
            this.base.left += xDelta;
        }

        this.base.width -= xDelta;
    }

    private valueFromData(type: "max" | "min", key: "x" | "y0" | "y1", side?: "left" | "right"): number {
        const fn = type === "max" ? max : min;

        return (
            fn(this.chart.data, (datum: Array<DataPoint>, index: number): number | undefined => {
                if (
                    !this.chart.config.series[index].disabled &&
                    (key === "x" || side === (this.chart.config.series[index].axis ?? "left"))
                ) {
                    return fn(datum, point => point[key]);
                }

                return undefined;
            }) ??
            // Return defaults if undefined (min: 0, max: 1)
            (type === "max" ? 1 : 0)
        );
    }
}
