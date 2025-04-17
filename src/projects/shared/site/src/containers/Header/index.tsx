import {Utility} from "shared/site/containers/Header/Right/UtilitiesDropdown";

import {HeaderLeft}  from "./Left";
import {HeaderRight} from "./Right";

import "./index.scss";
import {VersionConflictResolver} from "shared/site/utils/ApiMethods";


type Props = {
    img: string;
    extraUtilities: Utility[];
    versionConflictResolver: VersionConflictResolver;
    serialize: () => Blob;
}
export const Header = ({ img, extraUtilities, versionConflictResolver, serialize }: Props) => (
    <header id="header">
        <HeaderLeft />

        <div className="header__center">
            <a href="/" target="_blank">
                <img className="header__center__logo" src={img}
                     width="200px" height="100%" alt="OpenCircuits logo" />
            </a>
            <a href="https://github.com/OpenCircuits/OpenCircuits/" rel="noreferrer" target="_blank">
                <img className="header__center__github" src="img/icons/github.svg"
                     width="40px" height="40px" alt="GitHub logo" />
            </a>
        </div>

        <HeaderRight extraUtilities={extraUtilities}
                     versionConflictResolver={versionConflictResolver}
                     serialize={serialize} />
    </header>
);
