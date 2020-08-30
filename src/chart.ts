/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {Component, Config, Data, Hook, OptionalComponent} from "../types";

import components from "./components";
import resolveConfig from "./config";
import {applyCanvasSize} from "./helpers/canvas";

export default class Chart {
    public canvas!: HTMLCanvasElement;

    public components: Record<string, Component> = {};

    public config!: Config;

    public ctx!: CanvasRenderingContext2D;

    public data!: Data;

    public height!: number;

    public width!: number;

    public constructor(config: Config) {
        this.update(config);
    }

    public destroy(): void {
        // Execute destroy hook on all active components then remove the canvas
        // from its parent DOM node.
        Object.values(this.components).forEach(component => component.destroy?.call(component));

        if (this.canvas) {
            this.canvas.parentNode?.removeChild(this.canvas);
        }
    }

    public draw(): void {
        if (!this.config.bindTo) {
            throw new Error("cannot get bound node");
        }

        const hooks: Array<Hook> = ["beforeDraw", "draw", "afterDraw"];

        // Check whether or not canvas has already been initialized. If not,
        // create new canvas and initialize main properties.
        if (!this.canvas) {
            this.config.bindTo.classList.add("chart-container");
            this.config.bindTo.style.backgroundColor = this.config.background?.color as string;

            this.canvas = this.config.bindTo.appendChild(document.createElement("canvas"));
            this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

            hooks.unshift("init");
        }

        // Inherit size from bound element. Size might be altered by components
        // later in the process (e.g. legend).
        const rect = this.config.bindTo.getBoundingClientRect();
        this.height = rect.height;
        this.width = rect.width;

        applyCanvasSize(this.canvas, this.ctx, this.height, this.width);

        // Loop through all active components to execute hooks in given
        // specific order: init (first draw only), beforeDraw, draw, afterDraw.
        const components = Object.values(this.components);

        hooks.forEach(hook => {
            components.forEach(component => component[hook]?.call(component));
        });

        this.config.events?.afterDraw?.();
    }

    public update(config: Config | null = null): void {
        // Resolve configuration by merge defaults to configuration coming
        // along with the call. Then trigger data update based on new
        // configuration content.
        if (config !== null) {
            this.config = resolveConfig(config);
        }

        // Register all components, then perform initial configuration and data
        // update.
        components.forEach(constructor => {
            const name = constructor.name.replace(/Component$/, "").toLowerCase();
            const state = (constructor as OptionalComponent).enabled?.(this.config) ?? true;

            if (state && !this.components[name]) {
                this.components[name] = new constructor(this);

                // Initialize newly enabled components (only upon update, i.e.
                // having canvas already initialized).
                if (this.canvas) {
                    this.components[name].init?.();
                }
            } else if (!state && this.components[name]) {
                // Destroy and unreference no longer needed component
                this.components[name].destroy?.();
                delete this.components[name];
            }
        });

        this.updateData();
    }

    private updateData(): void {
        switch (this.config.axes?.y?.stack) {
            default:
                this.data = this.config.series.map(series =>
                    series.points.map(point => {
                        const [y0, y1] = [0, point[1]].sort((a, b) => (a ?? 0) - (b ?? 0));
                        return {x: point[0], y0, y1};
                    }),
                );
        }
    }
}
