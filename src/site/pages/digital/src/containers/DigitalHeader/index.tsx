import {CircuitInfo} from "core/utils/CircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {Header} from "shared/containers/Header";


type Props = {
    img: string;
    helpers: CircuitInfoHelpers;
    info: CircuitInfo;
}

export const DigitalHeader = ({ img, helpers, info }: Props) => (
    <Header img={img} helpers={helpers} info={info} extraUtilities={[
        {
            popupName: "expr_to_circuit",
            img:       "img/icons/bool_expr_input_icon.svg",
            text:      "Boolean Expression to Circuit",
        },
    ]} />
);
