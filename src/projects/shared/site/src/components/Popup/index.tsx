import { Overlay } from "../Overlay";

import "./index.scss";

type Props = {
    readonly title: string;
    readonly isOpen: boolean;
    readonly close: () => void;
    readonly className?: string;
    readonly width?: number;
    readonly height?: number;
    readonly children: React.ReactNode;
};
export const Popup = ({ title, isOpen, close, className, width, height, children }: Props) => (
    <>
        <Overlay isOpen={isOpen} close={close} />

        <div
            className={"popup " + (className ?? "")}
            style={{
                display: isOpen ? "initial" : "none",
                width: `${width}%`,
                height: `${height}%`,
            }}
        >
            <h1>{title}</h1>
            <hr />
            {children}
        </div>
    </>
);
