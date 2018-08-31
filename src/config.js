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
            lines: [],
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
    background: {
        color: null,
    },
    colors: [
        "#64b5f6", "#455a64", "#aed581", "#ffb74d", "#9575cd", "#f06292",
        "#ffd54f", "#4db6ac", "#4dd0e1", "#e57373", "#7986cb", "#a1887f",
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
