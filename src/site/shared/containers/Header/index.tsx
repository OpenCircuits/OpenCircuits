import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {HeaderLeft} from "./Left";
import {HeaderRight} from "./Right";

import "./index.scss";

// type Tool = {
//     popupName: string;
//     img: string;
// }
type Props = {
    img: string;
    helpers: CircuitInfoHelpers;
    extraToolsPopupNames: string[];
    extraToolsimgNames: string[];
}
export const Header = ({ img, helpers, extraToolsPopupNames, extraToolsimgNames }: Props) => (
    <header id="header">
        <HeaderLeft helpers={helpers} />

        <div>
            <a href="/home" target="_blank">
                <img className="header__center__logo" src={img} height="100%" alt="OpenCircuits logo" />
            </a>
            <a href="https://github.com/OpenCircuits/OpenCircuits/" rel="noreferrer" target="_blank">
                <img className="header__center__github" src="img/icons/github.svg" height="100%" alt="GitHub logo" />
            </a>
        </div>

        <HeaderRight helpers={helpers} extraToolsPopupNames={extraToolsPopupNames} extraToolsimgNames={extraToolsimgNames} />
    </header>
);
