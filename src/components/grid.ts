/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {XAxis, YAxis} from "../../types";

import Component from "../component";
import {toRGBA} from "../helpers/style";
import Axes from "./axes";
import Base from "./base";

export default class Grid extends Component {
    private axes!: Axes;

    private base!: Base;

    public init(): void {
        this.axes = this.chart.components.axes as Axes;
        this.base = this.chart.components.base as Base;
    }

    public draw(): void {
        const ctx = this.chart.ctx;

        ctx.save();
        ctx.beginPath();

        Object.assign(ctx, {
            lineWidth: 1,
            strokeStyle: toRGBA(this.chart.config.font?.color as string, 0.15),
        });

        // Trace axes grid based on current configuration, then call "stroke"
        // to trace all of them at once.
        if (this.chart.config.axes?.x?.grid) {
            this.drawXGrid(this.chart.config.axes.x, this.axes.scales.x);
        }
        if (this.axes.state.left && this.chart.config.axes?.y?.left?.grid) {
            this.drawYGrid(this.chart.config.axes.y.left, this.axes.scales.yLeft);
        }
        if (this.axes.state.right && this.chart.config.axes?.y?.right?.grid) {
            this.drawYGrid(this.chart.config.axes.y.right, this.axes.scales.yRight);
        }

        ctx.stroke();
        ctx.restore();
    }

    private drawXGrid(axis: XAxis, scale: d3.ScaleTime<number, number>): void {
        const ctx = this.chart.ctx;

        scale.ticks(axis.ticks?.count as number).forEach((tick, index, ticks) => {
            // Skip first and last ticks to avoid Y axes tick bars to overlap
            // with grid line.
            if (index > 0 && index < ticks.length - 1) {
                const pos = scale(tick);
                ctx.moveTo(pos, this.base.top);
                ctx.lineTo(pos, this.base.top + this.base.height);
            }
        });
    }

    private drawYGrid(axis: YAxis, scale: d3.ScaleLinear<number, number>): void {
        const ctx = this.chart.ctx;

        scale.ticks(axis.ticks?.count as number).forEach((tick, index) => {
            // Skip first first tick to avoid X axis tick bar to overlap with
            // grid line.
            if (index > 0) {
                const pos = scale(tick);
                ctx.moveTo(this.base.left, pos);
                ctx.lineTo(this.base.left + this.base.width, pos);
            }
        });
    }
}
