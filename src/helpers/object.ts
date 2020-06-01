/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

function isObject(obj: unknown): boolean {
    return obj && typeof obj === "object" && !Array.isArray(obj);
}

export function merge<T>(obj: T, ...sources: Array<T>): T {
    if (sources.length === 0) {
        return obj;
    }

    while (sources.length > 0) {
        const dst = obj as Record<string, unknown>;
        const src = sources.shift();

        for (const key in src) {
            if (!isObject(src[key]) || !dst[key]) {
                Object.assign(dst, {[key]: src[key]});
            } else {
                merge(dst[key], src[key]);
            }
        }
    }

    return obj;
}
