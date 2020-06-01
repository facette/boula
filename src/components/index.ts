/**
 * Copyright (c) 2020, Vincent Batoufflet
 *
 * Licensed under the terms of the BSD 3-Clause License; a copy of the license
 * is available at: https://opensource.org/licenses/BSD-3-Clause
 */

import {Component, Constructor} from "../../types";

import Axes from "./axes";
import Base from "./base";
import Cursor from "./cursor";
import Events from "./events";
import Grid from "./grid";
import Legend from "./legend";
import Markers from "./markers";
import Selection from "./selection";
import Title from "./title";
import Tooltip from "./tooltip";

import Area from "./types/area";

export default [
    Legend,
    Base,
    Title,
    Grid,
    Axes,
    Markers,
    Events,
    Cursor,
    Selection,
    Tooltip,

    // Types
    Area,
] as Array<Constructor<Component>>;
