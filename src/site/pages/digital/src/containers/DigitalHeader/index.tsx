import {Header} from "shared/containers/Header";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";


type Props = {
    img: string;
    helpers: CircuitInfoHelpers;
}

export const DigitalHeader = ({ img, helpers }: Props) => (
    <Header img={img} helpers={helpers} extraUtilities={[
        {
            popupName: "expr_to_circuit",
            img: "img/icons/bool_expr_input_icon.svg",
            text: "Boolean Expression to Circuit",
        },
    ]} />
);
