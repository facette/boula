/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {Bisector, bisector} from "d3-array";

import {Config, Formatter, Point} from "../../types";

import Component from "../component";
import {toRGBA} from "../helpers/style";
import Axes from "./axes";
import Events, {EventData} from "./events";

export default class TooltipComponent extends Component {
    private axes!: Axes;

    private tooltip!: HTMLDivElement;

    private events!: Events;

    private hidden = true;

    private margin!: number;

    private paused = false;

    private title!: HTMLDivElement;

    private total!: HTMLDivElement;

    private values: Record<number, HTMLDivElement> = {};

    public static enabled(config: Config): boolean {
        return config.tooltip?.enabled as boolean;
    }

    public init(): void {
        this.axes = this.chart.components.axes as Axes;
        this.events = this.chart.components.events as Events;

        this.events.register("mouseleave", this.onEvent.bind(this));
        this.events.register("mousemove", this.onEvent.bind(this));

        this.tooltip = document.createElement("div");
        this.tooltip.className = "chart-tooltip left";
        this.chart.config.bindTo.appendChild(this.tooltip);

        // Retrieve X translation value from CSS transform matrix
        this.margin = new DOMMatrix(getComputedStyle(this.tooltip).transform).e;
    }

    public draw(): void {
        // Clear current tooltip element from all its children
        while (this.tooltip.lastChild) {
            this.tooltip.removeChild(this.tooltip.lastChild);
        }

        Object.assign(this.tooltip.style, {
            backgroundColor: toRGBA(this.chart.config.font?.color as string, 0.98),
            color: this.chart.config.background?.color,
        });

        const colors = this.chart.config.colors as Array<string>;

        this.title = this.tooltip.appendChild(document.createElement("div"));
        this.title.className = "chart-tooltip-title";
        this.title.style.color = toRGBA(this.chart.config.background?.color as string, 0.65);

        this.chart.config.series.forEach((series, index) => {
            if (series.disabled) {
                return;
            }

            const entry = this.tooltip.appendChild(document.createElement("div"));
            entry.className = "chart-tooltip-entry";

            const paint = entry.appendChild(document.createElement("div"));
            paint.className = "chart-tooltip-paint";
            paint.style.backgroundColor = series.color ?? colors[index % colors.length];

            const label = entry.appendChild(document.createElement("div"));
            label.className = "chart-tooltip-label";
            label.appendChild(document.createTextNode(series.label ?? `series${index}`));

            const value = entry.appendChild(document.createElement("div"));
            value.className = "chart-tooltip-value";
            value.appendChild(document.createTextNode("null"));

            // Keep reference of the tooltip value element for future updates
            // while receiving events.
            this.values[index] = value;
        });

        if (this.chart.config.series.length > 1) {
            this.total = this.tooltip.appendChild(document.createElement("div"));
            this.total.className = "chart-tooltip-total";
        }
    }

    public destroy(): void {
        this.events.unregister("mouseleave", this.onEvent);
        this.events.unregister("mousemove", this.onEvent);

        this.chart.config.bindTo.removeChild(this.tooltip);
    }

    public pause(state: boolean): void {
        this.paused = state;
        if (state) {
            this.hide();
        }
    }

    private onEvent(ev: Event, data: EventData): void {
        if (this.paused) {
            return;
        }

        const filtered = data.date ? this.chart.config.series.filter(series => !series.disabled) : [];
        if (!data.date || filtered.length === 0) {
            if (!this.hidden) {
                this.hide();
            }
            return;
        }

        const bisect: Bisector<Point, Date> = bisector(p => p[0]);
        const date = data.date;
        const hasTotal = filtered.length > 1;
        const totals = {left: 0, right: 0};

        this.title.textContent = (this.chart.config.tooltip?.date?.format as Formatter<Date>)(date);

        this.chart.config.series.forEach((series, index) => {
            if (series.disabled) {
                return;
            }

            const axis = series.axis ?? "left";
            const value = series.points[series.points ? bisect.left(series.points, date, 1) : -1]?.[1] ?? null;

            const el = this.values[index];
            if (el) {
                el.textContent = this.axes.formatters[axis === "left" ? "yLeft" : "yRight"](value) as string;
            }

            if (hasTotal && value) {
                totals[axis] += value;
            }
        });

        if (hasTotal) {
            const parts: Array<string> = [];

            if (this.axes.state.left) {
                parts.push(this.axes.formatters.yLeft(totals.left));
            }

            if (this.axes.state.right) {
                parts.push(this.axes.formatters.yRight(totals.right));
            }

            this.total.textContent = `Σ = ${parts.join(" / ")}`;
        }

        // Prevent initial flickering with zero height
        if (!this.tooltip.clientHeight) {
            Object.assign(this.tooltip.style, {display: "block", visibility: "hidden"});
            return;
        }

        const me = ev as MouseEvent;
        let left = data.x as number;
        let top = data.y as number;

        if (me.pageX + this.tooltip.clientWidth + this.margin >= document.documentElement.clientWidth) {
            left -= this.tooltip.clientWidth;
            this.tooltip.classList.replace("left", "right");
        } else {
            this.tooltip.classList.replace("right", "left");
        }

        if (me.pageY + this.tooltip.clientHeight >= document.documentElement.clientHeight) {
            top -= this.tooltip.clientHeight;
        }

        Object.assign(this.tooltip.style, {
            left: `${left}px`,
            top: `${top}px`,
            visibility: null,
        });

        this.hidden = false;
    }

    private hide(): void {
        this.tooltip.style.display = "none";
        this.hidden = true;
    }
}
