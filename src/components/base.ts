/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import Component from "../component";

export default class Base extends Component {
    public height!: number;

    public left!: number;

    public top!: number;

    public width!: number;

    public beforeDraw(): void {
        this.clear();

        // Initialize base layout by applying margins. It might later be updated
        // by other components to reflect implied translations (e.g. axes,
        // titles).
        const margin = this.chart.config.margin as number;

        Object.assign(this, {
            left: margin,
            top: margin,
            height: this.chart.height - 2 * margin,
            width: this.chart.width - 2 * margin,
        });

        // Base is the first component being handled by hooks. Thus initialize
        // common context properties in "beforeDraw" for other components to
        // inherit from.
        Object.assign(this.chart.ctx, {
            fillStyle: this.chart.config.font?.color,
            font: `${this.chart.config.font?.size}px ${this.chart.config.font?.family}`,
        });
    }

    private clear(): void {
        const ctx = this.chart.ctx;
        const background = this.chart.config.background?.color;

        // Canvas is to be cleared, thus erase whole area and paint inherited
        // background if any.
        ctx.clearRect(0, 0, this.chart.width, this.chart.height);

        if (background !== undefined) {
            ctx.fillStyle = background;

            ctx.beginPath();
            ctx.rect(0, 0, this.chart.width, this.chart.height);
            ctx.fill();
        }
    }
}
