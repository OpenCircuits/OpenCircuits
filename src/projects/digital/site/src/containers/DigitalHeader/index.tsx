import {Header} from "shared/site/containers/Header";

import logo from "./logo.svg";
import boolExprInputIcon from "./bool_expr_input_icon.svg";


export const DigitalHeader = () => (
    <Header img={logo}
            extraUtilities={[
                {
                    popupName: "expr_to_circuit",
                    img:       boolExprInputIcon,
                    text:      "Boolean Expression to Circuit",
                },
            ]} />
);
