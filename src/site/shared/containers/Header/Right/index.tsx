import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";
import { useState } from "react";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const HeaderRight = ({ helpers }: Props) => {

    const [isHidden, setHidden] = useState(true) 

        return (
            <div>  
                <div className="header__right">
                    <TutorialDropdown />
                    <OpenFileButton helpers={helpers} />
                    <DownloadMenuDropdown helpers={helpers} />
                    <SignInOutButtons />
                </div>
                <div className="header__right__alt">
                    <button type="button" onClick = {() => setHidden(!isHidden)}><img className ="expand" 
                    src={isHidden ? "img/icons/expand.svg" : "img/icons/collapse.svg"} alt = ""/></button>
                    <div id={isHidden ? 'hidden' : 'notHidden' } >
                        <li><OpenFileButton helpers={helpers} /></li>
                        <li><TutorialDropdown /></li>
                        <li><DownloadMenuDropdown helpers={helpers} /></li>
                        <li><SignInOutButtons /></li>
                    </div>
                </div>
            </div>  
        );
    }
