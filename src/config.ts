/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {rgb} from "d3-color";
import {format} from "d3-format";
import {curveLinear} from "d3-shape";
import {timeDay, timeHour, timeMinute, timeMonth, timeSecond, timeYear} from "d3-time";
import {timeFormat} from "d3-time-format";

import {Config} from "../types";

import {merge} from "./helpers/object";

const labelMargin = 24;

const margin = 16;

const tickMargin = 4;

const tickSize = 8;

export const colors = [
    "#64b5f6",
    "#455a64",
    "#aed581",
    "#ffb74d",
    "#9575cd",
    "#f06292",
    "#ffd54f",
    "#4db6ac",
    "#4dd0e1",
    "#e57373",
    "#7986cb",
    "#a1887f",
];

export default function resolveConfig(config: Config): Config {
    const style = getComputedStyle(config.bindTo);

    let el: HTMLElement | null = config.bindTo;
    let backgroundColor!: string;

    while (backgroundColor === undefined && el !== null) {
        const value = getComputedStyle(el).backgroundColor;
        if (rgb(value).opacity === 0) {
            el = el.parentNode as HTMLElement;
        } else {
            backgroundColor = value;
        }
    }

    return merge<Config>(
        {
            area: {
                curve: curveLinear,
                fill: true,
                lineWidth: 1,
            },
            axes: {
                x: {
                    draw: true,
                    grid: true,
                    ticks: {
                        count: 10,
                        draw: true,
                        format: (date: Date): string =>
                            (timeSecond(date) < date
                                ? timeFormat(".%L")
                                : timeMinute(date) < date
                                ? timeFormat(":%S")
                                : timeHour(date) < date
                                ? timeFormat("%H:%M")
                                : timeDay(date) < date
                                ? timeFormat("%H:00")
                                : timeMonth(date) < date
                                ? timeFormat("%a %d")
                                : timeYear(date) < date
                                ? timeFormat("%B")
                                : timeFormat("%Y"))(date),
                        margin: tickMargin,
                        size: tickSize,
                    },
                },
                y: {
                    left: {
                        draw: true,
                        grid: true,
                        label: {
                            margin: labelMargin,
                        },
                        ticks: {
                            count: 3,
                            draw: true,
                            format: format(".2r"),
                            margin: tickMargin,
                            size: tickSize,
                        },
                    },
                    right: {
                        draw: true,
                        grid: true,
                        label: {
                            margin: labelMargin,
                        },
                        ticks: {
                            count: 3,
                            draw: true,
                            format: format(".2r"),
                            margin: tickMargin,
                            size: tickSize,
                        },
                    },
                    stack: false,
                },
            },
            background: {
                color: backgroundColor,
            },
            colors,
            cursor: {
                enabled: true,
            },
            font: {
                color: style.color,
                family: style.fontFamily,
                size: parseInt(style.fontSize, 10),
            },
            legend: {
                enabled: true,
            },
            margin,
            selection: {
                enabled: false,
            },
            title: {
                margin,
            },
            tooltip: {
                date: {
                    format: timeFormat("%c"),
                },
                enabled: true,
            },
            type: "area",
        } as Config,
        config,
    );
}
