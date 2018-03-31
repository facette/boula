import Chart from "./chart";

import helpers from "./helpers";
import components from "./components/index";

Chart.helpers = helpers;
Chart.components = components;

import area from "./components/area";
import axes from "./components/axes";
import data from "./components/data";
import events from "./components/events";
import scales from "./components/scales";
import series from "./components/series";
import titles from "./components/titles";

area(Chart);
axes(Chart);
data(Chart);
events(Chart);
scales(Chart);
series(Chart);
titles(Chart);

export default Chart;
