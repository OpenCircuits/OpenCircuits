import {CircuitInfo} from "core/utils/CircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {Header} from "shared/containers/Header";


type Props = {
    img: string;
    helpers: CircuitInfoHelpers;
    info: CircuitInfo;
}
export const AnalogHeader = ({ img, helpers, info }: Props) => (
    <Header img={img} helpers={helpers} info={info} extraUtilities={[]} />
);
