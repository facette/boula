/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {Formatter} from "../../types";

import Component from "../component";
import {measureText} from "../helpers/canvas";
import {applyFontSize} from "../helpers/style";
import Axes from "./axes";
import Base from "./base";

const markerPadding = 4;

const padding15 = markerPadding * 1.5;

const padding20 = markerPadding * 2;

const padding25 = markerPadding * 2.5;

const pi05 = Math.PI * 0.5;

const pi15 = Math.PI * 1.5;

export default class Markers extends Component {
    private axes!: Axes;

    private base!: Base;

    public init(): void {
        this.axes = this.chart.components.axes as Axes;
        this.base = this.chart.components.base as Base;
    }

    public afterDraw(): void {
        const ctx = this.chart.ctx;
        const backgroundColor = this.chart.config.background?.color as string;
        const fontColor = this.chart.config.font?.color as string;

        this.chart.config.markers?.forEach(marker => {
            let format: Formatter<number | null>;
            let scale: d3.ScaleLinear<number, number>;
            const axis = marker.axis ?? "left";

            if (axis === "left") {
                format = this.axes.formatters.yLeft;
                scale = this.axes.scales.yLeft;
            } else {
                format = this.axes.formatters.yRight;
                scale = this.axes.scales.yRight;
            }

            const tickLabelDelta =
                (this.chart.config.axes?.y?.[axis]?.ticks?.size as number) +
                (this.chart.config.axes?.y?.[axis]?.ticks?.margin as number);

            const color = marker.color ?? fontColor;
            const pos = scale(marker.value);
            let xDelta = 0;

            if (marker.label) {
                ctx.save();

                Object.assign(ctx, {
                    font: applyFontSize(ctx, (this.chart.config.font?.size as number) * 0.85),
                    fillStyle: color,
                    textAlign: "left",
                    textBaseline: "middle",
                });

                const text = typeof marker.label === "boolean" ? format(marker.value) : marker.label;
                const measure = measureText(ctx, text);
                const width = measure.width + tickLabelDelta + markerPadding * 2;

                ctx.beginPath();

                // Ensure long labels doesn't go out of chart on its left
                // and/or right sides by calculating a X initial translation
                // before tracing label path.
                if (axis === "left") {
                    xDelta = Math.max(width - this.axes.ticksWidth.left - markerPadding, 0);
                    if (xDelta > 0) {
                        ctx.translate(xDelta, 0);
                    }

                    ctx.translate(this.base.left, pos);
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(-padding15, padding20, -padding25, padding20);
                    ctx.lineTo(-width + markerPadding, padding20);
                    ctx.arc(-width + markerPadding, padding20 - markerPadding, markerPadding, pi05, Math.PI);
                    ctx.lineTo(-width, -padding20 + markerPadding);
                    ctx.arc(-width + markerPadding, -padding20 + markerPadding, markerPadding, Math.PI, pi15);
                    ctx.lineTo(-padding25, -padding20);
                    ctx.quadraticCurveTo(-padding15, -padding20, 0, 0);
                } else {
                    xDelta = Math.max(width - this.axes.ticksWidth.right - markerPadding, 0);
                    if (xDelta > 0) {
                        ctx.translate(-xDelta, 0);
                    }

                    ctx.translate(this.base.left + this.base.width, pos);
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(padding15, padding20, padding25, padding20);
                    ctx.lineTo(width - markerPadding, padding20);
                    ctx.arc(width - markerPadding, padding20 - markerPadding, markerPadding, pi05, 0, true);
                    ctx.lineTo(width, -padding20 + markerPadding);
                    ctx.arc(width - markerPadding, -padding20 + markerPadding, markerPadding, 0, pi15, true);
                    ctx.lineTo(padding25, -padding20);
                    ctx.quadraticCurveTo(padding15, -padding20, 0, 0);
                }

                ctx.fill();

                // Draw label text centered in label
                ctx.fillStyle = backgroundColor;
                if (axis === "left") {
                    ctx.fillText(text, -width + markerPadding * 2, 0);
                } else {
                    ctx.fillText(text, tickLabelDelta, 0);
                }

                ctx.restore();
            }

            ctx.save();
            ctx.beginPath();

            Object.assign(ctx, {
                lineWidth: 1,
                strokeStyle: color,
            });
            if (marker.dashed) {
                ctx.setLineDash([4, 4]);
            }

            if (axis === "left") {
                ctx.moveTo(this.base.left + xDelta - markerPadding, pos);
                ctx.lineTo(this.base.left + this.base.width, pos);
            } else {
                ctx.moveTo(this.base.left, pos);
                ctx.lineTo(this.base.left + this.base.width - xDelta + markerPadding, pos);
            }

            ctx.stroke();
            ctx.restore();
        });
    }
}
