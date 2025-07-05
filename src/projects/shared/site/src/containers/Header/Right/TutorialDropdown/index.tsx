import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CloseHeaderMenus, OpenHeaderMenu, OpenHeaderPopup} from "shared/site/state/Header";

import {Dropdown} from "../Dropdown";

import githubIcon         from "shared/site/img/github.svg";
import helpIcon           from "./help.svg";
import tourIcon           from "./tour_general.svg";
import quickStartIcon     from "./quick_start.svg";
import videoTutorialsIcon from "./video_tutorials.svg";
import userGuideIcon      from "./user_guide.svg";
import helpCenterIcon     from "./help_center.svg";
import keyboardIcon       from "./keyboard.svg";


export const TutorialDropdown = () => {
    const { curMenu } = useSharedSelector(
        (state) => ({ curMenu: state.header.curMenu })
    );
    const dispatch = useSharedDispatch();

    return (
        <Dropdown open={(curMenu === "tutorial")}
                  btnInfo={{ title: "Help", src: helpIcon }}
                  onClick={() => dispatch(OpenHeaderMenu("tutorial"))}
                  onClose={() => dispatch(CloseHeaderMenus())}>
            <h1>Tours</h1>
            <hr />
            <div className="disabled">
                <img src={tourIcon} height="100%" alt="Take a tour of OpenCircuits" />
                <span>General Tour</span>
            </div>
            <h1>Resources</h1>
            <hr />
            <div role="button" tabIndex={0}
                 onClick={() => {
                    dispatch(CloseHeaderMenus());
                    dispatch(OpenHeaderPopup("quick_start"));
                }}>
                <img src={quickStartIcon} height="100%" alt="Check out our Quick Start guide" />
                <span>Quick Start</span>
            </div>
            <a className="hide-link" target="_blank" href="http://docs.opencircuits.io" rel="noreferrer">
                <img src={githubIcon} height="100%" alt="Check out our Documentation" />
                <span>Documentation</span>
            </a>
            <div className="disabled">
                <img src={videoTutorialsIcon} height="100%" alt="Check out our Video Tutorials" />
                <span>Video Tutorials</span>
            </div>
            <div className="disabled">
                <img src={userGuideIcon} height="100%" alt="Read our User Guide" />
                <span>OpenCircuits User Guide</span>
            </div>
            <div className="disabled">
                <img src={helpCenterIcon} height="100%" alt="Check out our Help Center" />
                <span>Help Center</span>
            </div>
            <div role="button" tabIndex={0}
                 onClick={() => {
                    dispatch(CloseHeaderMenus());
                    dispatch(OpenHeaderPopup("keyboard_shortcuts"));
                }}>
                <img src={keyboardIcon} height="100%" alt="See our Keyboard Shortcuts" />
                <span>Keyboard Shortcuts</span>
            </div>
        </Dropdown>
    );
}
