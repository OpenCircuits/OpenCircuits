import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {Utility} from "shared/containers/Header/Right/UtilitiesDropdown";

import {HeaderLeft} from "./Left";
import {HeaderRight} from "./Right";

import {CircuitInfo} from "core/utils/CircuitInfo";

import "./index.scss";


type Props = {
    img: string;
    helpers: CircuitInfoHelpers;
    info: CircuitInfo;
    extraUtilities: Utility[];
}
export const Header = ({ img, helpers, info, extraUtilities }: Props) => (

    <header id="header">
        <HeaderLeft helpers={helpers} />

        <div className="header__center">
            <a href="/" target="_blank">
                <img className="header__center__logo" src={img} height="100%" alt="OpenCircuits logo" />
            </a>
            <a href="https://github.com/OpenCircuits/OpenCircuits/" rel="noreferrer" target="_blank">
                <img className="header__center__github" src="img/icons/github.svg" height="100%" alt="GitHub logo" />
            </a>
        </div>

        <HeaderRight helpers={helpers} info={info} extraUtilities={extraUtilities} />
    </header>
);
