import React, {useEffect} from "react";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";


const DOCUMENT_NODE_TYPE = 9;

function parentOf(elem: Element, target: string) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    let el = elem as Element | null;

    // Loop through each parent element and see if it matches the target
    //  also stop if the nodeType == document
    while ((el = el!.parentElement) && el.nodeType !== DOCUMENT_NODE_TYPE) {
        if (el.matches(target))
            return true;
    }
    return false;
}


type Props = {
    children: React.ReactNode;
    open: boolean;
    btnInfo: {
        title: string;
        src: string;
    };
    onClick?: () => void;
    onClose?: () => void;
}
export const Dropdown = ({ open, btnInfo, onClick, onClose, children }: Props) => {
    // Check for clicking outside of the menu as to call onClose
    useEffect(() => {
        function onWindowClick(ev: MouseEvent) {
            if (!open || onClose === undefined)
                return;

            const target = ev.target as Element;
            if (!parentOf(target, ".header__right__dropdown"))
                onClose();
        }

        // listener for mobile and desktop (see Issue #597)
        const events = ["click", "touchend"];

        // Add listener on start
        events.forEach((e) => window.addEventListener(e, onWindowClick));

        // Remove listener for cleanup
        return () => {events.forEach((e) => window.removeEventListener(e, onWindowClick))};
    });

    const { h } = useWindowSize();

    return (
        <div className="header__right__dropdown">
            <button type="button"
                    className={`header__right__dropdown__button ${open ? "white" : ""}`}
                    title={btnInfo.title}
                    onClick={open ? onClose : onClick}>
                <img src={btnInfo.src} width="34px" height="34px" alt={btnInfo.title} />
            </button>
            <div className={`header__right__dropdown__content ${open ? "" : "hide"}`}
                 style={{ maxHeight: h-75+"px" }}>
                {children}
            </div>
        </div>
    );
}
