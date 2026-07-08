import { Overlay } from "../Overlay";

import "./index.scss";

type Props = {
    readonly title: string;
    readonly isOpen: boolean;
    readonly close: () => void;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly children: React.ReactNode;
};
export const Popup = ({ title, isOpen, close, className, style, children }: Props) => (
    <>
        <Overlay isOpen={isOpen} close={close} />

        <div
            className={"popup " + (className ?? "")}
            style={{
                display: isOpen ? "initial" : "none",
                ...style,
            }}
        >
            <button className="popup-close-btn" onClick={close}>
                &times;
            </button>
            <h1>{title}</h1>
            <hr />
            {children}
        </div>
    </>
);
