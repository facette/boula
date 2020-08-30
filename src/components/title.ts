/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import Component from "../component";
import {measureText} from "../helpers/canvas";
import Base from "./base";

export default class TitleComponent extends Component {
    private base!: Base;

    public init(): void {
        this.base = this.chart.components.base as Base;
    }

    public beforeDraw(): void {
        if (!this.chart.config.title?.text) {
            return;
        }

        // Chart has a title, thus measure its height and update base layout
        // accordingly.
        const yDelta =
            measureText(this.chart.ctx, this.chart.config.title.text).height +
            (this.chart.config.title?.margin as number);

        if (yDelta > 0) {
            this.base.top += yDelta;
            this.base.height -= yDelta;
        }
    }

    public draw(): void {
        if (!this.chart.config.title?.text) {
            return;
        }

        const ctx = this.chart.ctx;
        const fontColor = this.chart.config.font?.color as string;
        const margin = this.chart.config.margin as number;

        ctx.save();

        Object.assign(ctx, {
            fillStyle: fontColor,
            textAlign: "center",
            textBaseline: "top",
        });

        ctx.fillText(this.chart.config.title.text, this.base.left + this.base.width / 2, margin);
        ctx.restore();
    }
}
