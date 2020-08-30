/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {rgb} from "d3-color";

export function applyFontSize(ctx: CanvasRenderingContext2D, size: number): string {
    return `${size}px ${ctx.font.substr(ctx.font.indexOf(" ") + 1)}`;
}

export function toRGBA(input: string, opacity: number): string {
    const c = rgb(input);
    c.opacity = opacity;
    return c.toString();
}
