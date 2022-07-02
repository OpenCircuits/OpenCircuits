import React from "react";

import {SwitchToggle} from "shared/components/SwitchToggle";

import "./index.scss";


type Props = {
    displayCondition: boolean;
    option: boolean;
    setOption: React.Dispatch<React.SetStateAction<boolean>>;
    text: string;
}
export const BooleanOption = ({ displayCondition, option, setOption, text }: Props) => (
    displayCondition ? (<>
        <SwitchToggle isOn={option} height="40px"
                      onChange={() => setOption(!option)}>{text}</SwitchToggle>
        <br />
    </>) : null
);
