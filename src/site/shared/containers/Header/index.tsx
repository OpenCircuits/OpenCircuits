import {HeaderLeft} from "./Left";
import {HeaderRight} from "./Right";
import {OnDownloadFunc} from "./Right/DownloadMenuDropdown";

import "./index.scss";


type Props = {
    img: string;
    onDownload: OnDownloadFunc;
}
export const Header = ({ img, onDownload }: Props) => (
    <header id="header">
        <HeaderLeft />

        <div>
            <a href="/home" target="_blank">
                <img className="header__center__logo" src={img} height="100%" alt="OpenCircuits logo" />
            </a>
            <a href="https://github.com/OpenCircuits/OpenCircuits/" rel="noreferrer" target="_blank">
                <img className="header__center__github" src="img/icons/github.svg" height="100%" alt="GitHub logo" />
            </a>
        </div>

        <HeaderRight onDownload={onDownload} />
    </header>
);
