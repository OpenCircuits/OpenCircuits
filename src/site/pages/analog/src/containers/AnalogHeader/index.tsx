import {CircuitInfo} from "core/utils/CircuitInfo";

import {Header} from "shared/containers/Header";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";


type Props = {
    img: string;
    helpers: CircuitInfoHelpers;
    info: CircuitInfo;
}
export const AnalogHeader = ({ img, helpers, info }: Props) => (
    <Header img={img} helpers={helpers} info={info} extraUtilities={[]} />
);
