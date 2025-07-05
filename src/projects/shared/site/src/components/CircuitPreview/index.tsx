import {BackendCircuitMetadata} from "shared/site/api/Circuits";

import close from "./close.svg";

import "./index.scss";


type CircuitPreviewProps = {
    readonly?: boolean;
    data: BackendCircuitMetadata;
    onClick: () => void;
    onDelete: () => void;
}
export const CircuitPreview = ({ readonly, data, onClick, onDelete }: CircuitPreviewProps) => (
    <div role="button" tabIndex={0} className="circuit__preview" title="Load circuit" onClick={onClick}>
        <span className="circuit__preview__icon">
            <img src={data.thumbnail} alt={`Thumbnail for example circuit, ${data.name}`} />
        </span>
        <span className="circuit__preview__text">
            <div className="circuit__preview__text__name">{data.name}</div>
            <div className="circuit__preview__text__desc">{data.desc}</div>
        </span>
        {/* Don't show 'x' if readonly */}
        {!readonly &&
        (<span className="circuit__preview__controls">
            <img className="circuit_options" width="20px" src={close}
                 title="Delete Circuit" alt="X to delete"
                 onClick={(e) => { e.stopPropagation(); onDelete(); }} />
        </span>)}
    </div>
);
