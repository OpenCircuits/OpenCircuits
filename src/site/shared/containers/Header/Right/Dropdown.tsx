import React, {useEffect} from "react";


const DOCUMENT_NODE_TYPE = 9;

function parentOf(elem: Element, target: string) {
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
export function Dropdown(props: Props) {
    const {open, btnInfo, onClick, onClose} = props;

    // Check for clicking outside of the menu as to call onClose
    useEffect(() => {
        function onClick(ev: MouseEvent) {
            if (!open || onClose === undefined)
                return;

            const target = ev.target as Element;
            if (!parentOf(target, ".header__right__dropdown"))
                onClose();
        }

        // Add listener on start
        window.addEventListener("click", onClick);

        // Remove listener for cleanup
        return () => window.removeEventListener("click", onClick);
    });

    return (
        <div className="header__right__dropdown">
            <button className={`header__right__dropdown__button ${open ? "white" : ""}`}
                    title={btnInfo.title}
                    onClick={onClick}>
                <img src={btnInfo.src} height="100%" alt={btnInfo.title} />
            </button>
            <div className={`header__right__dropdown__content ${open ? "" : "hide"}`}>
                {props.children}
            </div>
        </div>
    );
}
