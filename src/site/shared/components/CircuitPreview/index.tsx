import {CircuitMetadata} from "core/models/CircuitMetadata";

import "./index.scss";

type CircuitPreviewProps = {
    readonly?: boolean;
    data: CircuitMetadata;
    onClick: () => void;
}
export const CircuitPreview = ({readonly, data, onClick}: CircuitPreviewProps) => (
    <div className="circuit__preview" title="Load circuit" onClick={onClick}>
        <span className="circuit__preview__icon">
            <img src={data.getThumbnail()} alt={`Thumbnail for example circuit, ${data.getName()}`} />
        </span>
        <span className="circuit__preview__text">
                <div className="circuit__preview__text__name">{data.getName()}</div>
                <div className="circuit__preview__text__desc">{data.getDesc()}</div>
        </span>
        {/* Don't show 'x' if readonly */}
        {!readonly &&
        <span className="circuit__preview__controls">
            <img className="circuit_options" width="20px" src="img/icons/close-24px.svg" title="Delete Circuit" alt={`X to delete `} />
        </span>}
    </div>
);
