import {Overlay} from "../Overlay";

import "./index.scss";


type Props = {
    title: string;
    isOpen: boolean;
    close: () => void;
    className?: string;
    width?: number;
    height?: number;
    children: React.ReactNode;
}
export const Popup = ({ title, isOpen, close, className, width, height, children }: Props) => (
    <>
        <Overlay isOpen={isOpen} close={close} />

        <div className={"popup " + (className ?? "")}
             style={{
                display: (isOpen ? "initial" : "none"),
                width:   `${width}%`,
                height:  `${height}%`,
             }}>
            <h1>{title}</h1>
            <hr />
            {children}
        </div>
    </>
);
