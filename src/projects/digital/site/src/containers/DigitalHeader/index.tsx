import {Header} from "shared/containers/Header";


export const DigitalHeader = () => (
    <Header img="img/icons/logo.svg" extraUtilities={[
        {
            popupName: "expr_to_circuit",
            img:       "img/icons/bool_expr_input_icon.svg",
            text:      "Boolean Expression to Circuit",
        },
    ]} />
);
