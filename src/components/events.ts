/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import Component from "../component";
import Axes from "./axes";
import Base from "./base";

export interface EventData {
    date?: Date;
    x?: number;
    y?: number;
}

type Callback = (ev: Event, data: EventData) => void;

export default class Events extends Component {
    private axes!: Axes;

    private base!: Base;

    private domRect!: DOMRect;

    private listeners!: Record<string, Array<Callback>>;

    public init(): void {
        this.axes = this.chart.components.axes as Axes;
        this.base = this.chart.components.base as Base;

        this.listeners = {};
    }

    public beforeDraw(): void {
        // Store DOMRect (useful for future boundaries check)
        this.domRect = this.chart.config.bindTo.getBoundingClientRect();
    }

    public register(type: string, callback: Callback): void {
        // Register a new event callback. If callback is first of its kind, thus
        // attach event listener to canvas.
        if (!this.listeners[type]) {
            this.listeners[type] = [callback];
            this.chart.canvas.addEventListener(type, this.onEvent.bind(this));
        } else {
            this.listeners[type].push(callback);
        }
    }

    public unregister(type: string, callback: Callback): void {
        // Unregister an event callback. If callback is last of its kind, thus
        // remove event listener from canvas.
        const index = this.listeners[type]?.indexOf(callback);
        if (index !== -1) {
            this.listeners[type].splice(index, 1);
            if (this.listeners[type].length === 0) {
                this.chart.canvas.removeEventListener(type, this.onEvent);
            }
        }
    }

    private inBoundaries(x: number, y: number): boolean {
        return (
            x >= this.base.left &&
            x < this.base.left + this.base.width &&
            y >= this.base.top &&
            y < this.base.top + this.base.height
        );
    }

    private onEvent(ev: Event): void {
        const data: EventData = {};

        if (ev.type.startsWith("mouse")) {
            const me = ev as MouseEvent;
            const x = me.pageX - this.domRect.left;
            const y = me.pageY - this.domRect.top;

            if (this.inBoundaries(x, y)) {
                Object.assign(data, {
                    date: this.axes.scales.x.invert(x),
                    x,
                    y,
                });
            }
        }

        this.listeners[ev.type]?.forEach(callback => callback(ev, data));
    }
}
