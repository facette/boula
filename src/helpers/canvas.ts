/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

export interface TextMeasure {
    height: number;
    width: number;
}

export function applyCanvasSize(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    height: number,
    width: number,
): void {
    // If device pixel ratio is greater than 1, then handle High DPI and
    // preserve quality by applying it to canvas.
    if (devicePixelRatio > 1) {
        Object.assign(canvas.style, {
            height: `${height}px`,
            width: `${width}px`,
        });

        Object.assign(canvas, {
            height: height * devicePixelRatio,
            width: width * devicePixelRatio,
        });

        ctx.scale(devicePixelRatio, devicePixelRatio);
    } else {
        Object.assign(canvas, {height, width});
    }
}

export function measureText(ctx: CanvasRenderingContext2D, text: string, font?: string): TextMeasure {
    let metrics: TextMetrics;

    if (font !== undefined) {
        // Optional font style is present, thus enclose measurement between
        // save/restore in order to avoid modifying current context.
        ctx.save();
        ctx.font = font;
        metrics = ctx.measureText(text);
        ctx.restore();
    } else {
        metrics = ctx.measureText(text);
    }

    return {
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
        width: metrics.width,
    };
}
