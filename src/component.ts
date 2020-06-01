/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import Chart from "./chart";

export default abstract class Component {
    protected chart: Chart;

    constructor(chart: Chart) {
        this.chart = chart;
    }
}
