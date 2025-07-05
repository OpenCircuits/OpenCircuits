import {Utility} from "shared/site/containers/Header/Right/UtilitiesDropdown";

import {HeaderLeft}  from "./Left";
import {HeaderRight} from "./Right";

import github from "shared/site/img/github.svg";

import "./index.scss";


type Props = {
    img: string;
    extraUtilities: Utility[];
}
export const Header = ({ img, extraUtilities }: Props) => (
    <header id="header">
        <HeaderLeft />

        <div className="header__center">
            <a href="/" target="_blank">
                <img className="header__center__logo" src={img}
                     width="200px" height="100%" alt="OpenCircuits logo" />
            </a>
            <a href="https://github.com/OpenCircuits/OpenCircuits/" rel="noreferrer" target="_blank">
                <img className="header__center__github" src={github}
                     width="40px" height="40px" alt="GitHub logo" />
            </a>
        </div>

        <HeaderRight extraUtilities={extraUtilities} />
    </header>
);
