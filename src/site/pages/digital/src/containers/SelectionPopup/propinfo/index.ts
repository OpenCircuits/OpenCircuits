import {PropInfoRecord}      from "shared/containers/SelectionPopup/propinfo/PropInfo";
import {DefaultComponentPropInfo,
        DefaultPortPropInfo,
        DefaultWirePropInfo} from "shared/containers/SelectionPopup/propinfo/DefaultPropInfo";


export const DigitalPropInfo: PropInfoRecord = {
    "DigitalPort": DefaultPortPropInfo,
    "DigitalWire": DefaultWirePropInfo,
    "DigitalNode": DefaultComponentPropInfo,

    "Switch":  DefaultComponentPropInfo,
    "LED":     DefaultComponentPropInfo,
    "ANDGate": DefaultComponentPropInfo,
    "ORGate":  DefaultComponentPropInfo,
    "NOTGate": DefaultComponentPropInfo,
} as const;
