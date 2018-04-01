import * as d3 from "d3";

const defaultConfig = {
    axes: {
        x: {
            max: null,
            min: null,
            ticks: {
                count: 10,
                font: {
                    size: 10,
                },
                size: 6,
            },
        },
        y: {
            center: false,
            label: {
                size: 12,
                text: null,
            },
            max: null,
            min: null,
            stack: false,
            ticks: {
                count: 3,
                font: {
                    size: 10,
                },
                format: d3.format(".2r"),
            },
        },
    },
    colors: [
        "#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9",
        "#f15c80", "#e4d354", "#8085e8", "#8d4653", "#91e8e1",
    ],
    events: {
        afterDraw: null,
        handleEvent: null,
    },
    font: {
        color: null,
        family: null,
    },
    margin: 24,
    titles: {
        main: {
            size: 16,
            text: null,
        },
        subtitle: {
            size: 12,
            text: null,
        },
    },
    type: "area",
};

export {defaultConfig};
