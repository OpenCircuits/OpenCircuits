import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";
import { useState, useEffect } from "react";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const HeaderRight = ({ helpers }: Props) => {

    const [isHidden, setHidden] = useState(true) 
    const [isDesktop, setDesktop] = useState({
        height: window.innerHeight,
        width: window.innerWidth
    })

    //Rerender on Browsing Resize
    useEffect(() => {
        function handleResize() {
            setDesktop({
                height: window.innerHeight,
                width: window.innerWidth
            })
        }
        window.addEventListener('resize', handleResize)

        return function clean() {
            window.removeEventListener('resize', handleResize)
        }
    })

    //Desktop
    if(isDesktop.width >= 500) {
        return (
            <div className="header__right">
                <TutorialDropdown />
                <OpenFileButton helpers={helpers} />
                <DownloadMenuDropdown helpers={helpers} />
                <SignInOutButtons />
            </div>
        );
    }
    //Mobile
    else {
        return (
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
        );
    }
}
