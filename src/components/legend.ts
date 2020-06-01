/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {Config} from "../../types";

import Component from "../component";
import {applyCanvasSize} from "../helpers/canvas";
import Base from "./base";

export default class Legend extends Component {
    private base!: Base;

    private legend!: HTMLDivElement;

    public static enabled(config: Config): boolean {
        return config.legend?.enabled as boolean;
    }

    public init(): void {
        this.base = this.chart.components.base as Base;

        this.legend = document.createElement("div");
        this.legend.classList.add("chart-legend");
        this.chart.config.bindTo.appendChild(this.legend);
    }

    public beforeDraw(): void {
        // Clear current legend element from all its children
        while (this.legend.lastChild) {
            this.legend.removeChild(this.legend.lastChild);
        }

        const colors = this.chart.config.colors as Array<string>;

        this.chart.config.series.forEach((series, index) => {
            const entry = this.legend.appendChild(document.createElement("div"));
            entry.className = "chart-legend-entry";
            if (series.disabled) {
                entry.classList.add("disabled");
            }
            entry.dataset.series = index.toString();

            const paint = entry.appendChild(document.createElement("div"));
            paint.className = "chart-legend-paint";
            paint.style.backgroundColor = series.color ?? colors[index % colors.length];

            entry.append(document.createTextNode(series.label ?? `series${index}`));

            entry.addEventListener("click", this.toggleSeries.bind(this));
        });

        // Update chart height to include legend in parent bounding rect
        this.chart.height -= this.legend.getBoundingClientRect().height + (this.chart.config.margin as number);
        applyCanvasSize(this.chart.canvas, this.chart.ctx, this.chart.height, this.chart.width);
    }

    public afterDraw(): void {
        // Align legend with base by applying padding computed from current
        // layout.
        Object.assign(this.legend.style, {
            paddingLeft: `${this.base.left}px`,
            paddingRight: `${this.chart.width - this.base.width - this.base.left}px`,
        });
    }

    public destroy(): void {
        this.chart.config.bindTo.removeChild(this.legend);
    }

    private toggleSeries(ev: MouseEvent): void {
        const cur = parseInt((ev.target as HTMLElement).dataset.series as string, 10);
        const state = this.chart.config.series.map(series => !series?.disabled ?? true);

        if (ev.shiftKey) {
            // Shift pressed, only toggle current
            state[cur] = !state[cur];
        } else if (state[cur] && state.filter(v => v).length === 1) {
            // Only current was active, thus toggle all
            state.fill(true);
        } else {
            // Default case, only keep current active and disable others
            state.map((_, index) => (state[index] = index === cur));
        }

        this.chart.config.series.forEach((series, index) => (series.disabled = !state[index]));

        this.chart.update();
        this.chart.draw();
    }
}
