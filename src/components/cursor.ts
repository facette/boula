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
import Events, {EventData} from "./events";

export default class CursorComponent extends Component {
    private axes!: Axes;

    private base!: Base;

    private cursor!: HTMLDivElement;

    private events!: Events;

    private hidden = true;

    private paused = false;

    public static enabled(config: Config): boolean {
        return config.cursor?.enabled as boolean;
    }

    public init(): void {
        this.axes = this.chart.components.axes as Axes;
        this.base = this.chart.components.base as Base;
        this.events = this.chart.components.events as Events;

        this.events.register("mouseleave", this.onEvent.bind(this));
        this.events.register("mousemove", this.onEvent.bind(this));

        this.cursor = document.createElement("div");
        this.cursor.classList.add("chart-cursor");
        this.chart.config.bindTo.appendChild(this.cursor);

        this.hide();
    }

    public draw(): void {
        Object.assign(this.cursor.style, {
            backgroundColor: toRGBA(this.chart.config.cursor?.color ?? (this.chart.config.font?.color as string), 0.5),
            height: `${this.base.height}px`,
            top: `${this.base.top}px`,
        });
    }

    public destroy(): void {
        this.events.unregister("mouseleave", this.onEvent);
        this.events.unregister("mousemove", this.onEvent);

        this.chart.config.bindTo.removeChild(this.cursor);
    }

    public move(date: Date | null): void {
        if (date === null) {
            if (!this.hidden) {
                this.hide();
            }
            return;
        }

        this.show(this.axes.scales.x(date));
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

        this.chart.config.events?.cursor?.(data.date ?? null);

        if (!data.date) {
            if (!this.hidden) {
                this.hide();
            }
            return;
        }

        if (data.x !== undefined) {
            this.show(data.x);
        }
    }

    private hide(): void {
        this.chart.canvas.style.removeProperty("cursor");
        this.cursor.style.display = "none";
        this.hidden = true;
    }

    private show(x: number): void {
        this.chart.canvas.style.cursor = "crosshair";
        Object.assign(this.cursor.style, {display: "block", left: `${x}px`});
        this.hidden = false;
    }
}
