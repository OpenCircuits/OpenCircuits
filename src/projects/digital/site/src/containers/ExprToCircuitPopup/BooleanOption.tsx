import React from "react";

import {SwitchToggle} from "shared/site/components/SwitchToggle";

import "./index.scss";


type Props = {
    isDisplayed: boolean;
    option: boolean;
    setOption: React.Dispatch<React.SetStateAction<boolean>>;
    text: string;
}
export const BooleanOption = ({ isDisplayed, option, setOption, text }: Props) => (
    isDisplayed && (<>
        <SwitchToggle isOn={option} height="40px"
                      onChange={() => setOption(!option)}>{text}</SwitchToggle>
        <br />
    </>)
);
