import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CloseHeaderMenus, OpenHeaderMenu, OpenHeaderPopup} from "shared/site/state/Header";

import {Dropdown} from "./Dropdown";


export const TutorialDropdown = () => {
    const { curMenu } = useSharedSelector(
        (state) => ({ curMenu: state.header.curMenu })
    );
    const dispatch = useSharedDispatch();

    return (
        <Dropdown open={(curMenu === "tutorial")}
                  btnInfo={{ title: "Help", src: "img/icons/help.svg" }}
                  onClick={() => dispatch(OpenHeaderMenu("tutorial"))}
                  onClose={() => dispatch(CloseHeaderMenus())}>
            <h1>Tours</h1>
            <hr />
            <div className="disabled">
                <img src="img/icons/tour_general.svg" height="100%" alt="Take a tour of OpenCircuits" />
                <span>General Tour</span>
            </div>
            <h1>Resources</h1>
            <hr />
            <div role="button" tabIndex={0}
                 onClick={() => {
                    dispatch(CloseHeaderMenus());
                    dispatch(OpenHeaderPopup("quick_start"));
                }}>
                <img src="img/icons/quick_start.svg" height="100%" alt="Check out our Quick Start guide" />
                <span>Quick Start</span>
            </div>
            <div>
                <a className="hide-link" target="_blank" href="http://docs.opencircuits.io" rel="noreferrer">
                    <img src="img/icons/github.svg" height="100%" alt="Check out our Documentation" />
                    <span>Documentation</span>
                </a>
            </div>
            <div className="disabled">
                <img src="img/icons/video_tutorials.svg" height="100%" alt="Check out our Video Tutorials" />
                <span>Video Tutorials</span>
            </div>
            <div className="disabled">
                <img src="img/icons/user_guide.svg" height="100%" alt="Read our User Guide" />
                <span>OpenCircuits User Guide</span>
            </div>
            <div className="disabled">
                <img src="img/icons/help_center.svg" height="100%" alt="Check out our Help Center" />
                <span>Help Center</span>
            </div>
            <div role="button" tabIndex={0}
                 onClick={() => {
                    dispatch(CloseHeaderMenus());
                    dispatch(OpenHeaderPopup("keyboard_shortcuts"));
                }}>
                <img src="img/icons/keyboard.svg" height="100%" alt="See our Keyboard Shortcuts" />
                <span>Keyboard Shortcuts</span>
            </div>
        </Dropdown>
    );
}
