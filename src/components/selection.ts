/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {Config} from "../../types";

import Component from "../component";
import {toRGBA} from "../helpers/style";
import Axes from "./axes";
import Base from "./base";
import Cursor from "./cursor";
import Events, {EventData} from "./events";
import Tooltip from "./tooltip";

export default class Selection extends Component {
    private anchor: number | null = null;

    private axes!: Axes;

    private base!: Base;

    private cursor!: Cursor | undefined;

    private events!: Events;

    private selection!: HTMLDivElement;

    private tooltip!: Tooltip | undefined;

    public static enabled(config: Config): boolean {
        return config.selection?.enabled as boolean;
    }

    public init(): void {
        this.axes = this.chart.components.axes as Axes;
        this.base = this.chart.components.base as Base;
        this.cursor = this.chart.components.cursor as Cursor | undefined;
        this.events = this.chart.components.events as Events;
        this.tooltip = this.chart.components.tooltip as Tooltip | undefined;

        this.events.register("mousedown", this.onEvent.bind(this));
        this.events.register("mousemove", this.onEvent.bind(this));
        this.events.register("mouseup", this.onEvent.bind(this));

        this.selection = document.createElement("div");
        this.selection.classList.add("chart-selection");
        this.chart.config.bindTo.appendChild(this.selection);
    }

    public draw(): void {
        const color = this.chart.config.selection?.color ?? (this.chart.config.font?.color as string);

        Object.assign(this.selection.style, {
            backgroundColor: toRGBA(color, 0.15),
            borderColor: color,
            height: `${this.base.height}px`,
            top: `${this.base.top}px`,
        });
    }

    public destroy(): void {
        this.events.unregister("mousedown", this.onEvent);
        this.events.unregister("mousemove", this.onEvent);
        this.events.unregister("mouseup", this.onEvent);

        this.chart.config.bindTo.removeChild(this.selection);
    }

    private onEvent(ev: Event, data?: EventData): void {
        if (this.anchor === null && !data?.date) {
            return;
        }

        switch (ev.type) {
            case "mousedown":
                document.addEventListener("mouseup", this.onEvent.bind(this));
                this.begin(data?.x as number);
                break;

            case "mousemove":
                this.update(data?.x as number);
                break;

            case "mouseup":
                document.removeEventListener("mouseup", this.onEvent);
                this.end(data?.x ?? null);
                break;
        }
    }

    private begin(x: number): void {
        this.chart.canvas.style.cursor = "col-resize";

        this.anchor = x;

        Object.assign(this.selection.style, {
            left: `${x}px`,
            width: "auto",
        });
    }

    private end(x: number | null): void {
        this.cursor?.pause(false);
        this.tooltip?.pause(false);

        if (x !== null) {
            this.chart.canvas.style.cursor = "crosshair";
        } else {
            this.chart.canvas.style.removeProperty("cursor");
        }

        if (this.anchor === null) {
            return;
        }

        if (this.chart.config.events?.select !== undefined && this.anchor !== x) {
            let anchor = this.anchor;
            if (x === null) {
                anchor = parseInt(this.selection.style.left, 10);
                x = Math.abs(anchor + parseInt(this.selection.style.width, 10));
            }

            const [from, to] = [this.axes.scales.x.invert(x), this.axes.scales.x.invert(anchor)].sort(
                (a, b) => a.valueOf() - b.valueOf(),
            );

            this.chart.config.events.select(from, to);
        }

        this.anchor = null;
        this.selection.style.display = "none";
    }

    private update(x: number): void {
        if (this.anchor === null) {
            return;
        }

        let style: Record<string, unknown>;
        if (x > this.anchor) {
            style = {left: `${this.anchor}px`, width: `${x - this.anchor}px`};
        } else {
            style = {left: `${x}px`, width: `${this.anchor - x}px`};
        }

        if (this.selection.style.display !== "block" && parseInt(this.selection.style.width, 10) > 1) {
            this.cursor?.pause(true);
            this.tooltip?.pause(true);

            style.display = "block";
        }

        Object.assign(this.selection.style, style);
    }
}
