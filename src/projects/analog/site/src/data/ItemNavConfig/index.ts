import { ItemNavConfig } from "shared/site/containers/ItemNav";

import capacitorIcon from "./icons/essentials/capacitor.svg";
import groundIcon from "./icons/essentials/ground.svg";
import inductorIcon from "./icons/essentials/inductor.svg";
import resistorIcon from "./icons/essentials/resistor.svg";
import oscilloscopeIcon from "./icons/measurements/oscilloscope.svg";
import labelIcon from "./icons/other/label.svg";
import currentSourceIcon from "./icons/sources/currentsource.svg";
import voltageSourceIcon from "./icons/sources/voltagesource.svg";

export default {
    "sections": [
        {
            "kind": "sources",
            "label": "Sources",
            "items": [
                {
                    "kind": "VoltageSource",
                    "label": "Voltage Source",
                    "icon": voltageSourceIcon,
                },
                {
                    "kind": "CurrentSource",
                    "label": "Current Source",
                    "icon": currentSourceIcon,
                },
            ],
        },
        {
            "kind": "essentials",
            "label": "Essentials",
            "items": [
                {
                    "kind": "Ground",
                    "label": "Ground",
                    "icon": groundIcon,
                },
                {
                    "kind": "Resistor",
                    "label": "Resistor",
                    "icon": resistorIcon,
                },
                {
                    "kind": "Capacitor",
                    "label": "Capacitor",
                    "icon": capacitorIcon,
                },
                {
                    "kind": "Inductor",
                    "label": "Inductor",
                    "icon": inductorIcon,
                },
            ],
        },
        {
            "kind": "measurements",
            "label": "Measurements",
            "items": [
                {
                    "kind": "Oscilloscope",
                    "label": "Oscillo-scope",
                    "icon": oscilloscopeIcon,
                },
            ],
        },
        {
            "kind": "other",
            "label": "Other",
            "items": [
                {
                    "kind": "Label",
                    "label": "Label",
                    "icon": labelIcon,
                },
            ],
        },
    ],
} satisfies ItemNavConfig;
