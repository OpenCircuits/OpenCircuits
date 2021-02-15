import {connect} from "react-redux";

import {Circuit} from "core/models/Circuit";
import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {SaveFile} from "shared/utils/Exporter";
import {SavePDF, SavePNG} from "shared/utils/ImageExporter";
import {Header} from "shared/containers/Header";
import {SharedAppState} from "shared/state";

import {GenerateThumbnail} from "site/digital/utils/GenerateThumbnail";


type OwnProps = {
    canvas: React.MutableRefObject<HTMLCanvasElement>;
    info: DigitalCircuitInfo;
}
type StateProps = {
    circuitName: string;
}
type DispatchProps = {}

type Props = StateProps & DispatchProps & OwnProps;
const _DigitalHeader = ({canvas, info, circuitName}: Props) => (
    <Header img="img/icons/logo.svg"
            onDownload={(type) => {
                switch (type) {
                    case "pdf":
                        SavePDF(canvas.current, circuitName);
                        break;
                    case "png":
                        SavePNG(canvas.current, circuitName);
                        break;
                    case "regular":
                        const thumbnail = GenerateThumbnail({ info });

                        const data = new Circuit(
                            new CircuitMetadataBuilder()
                                .withName(circuitName)
                                .withThumbnail(thumbnail)
                                .build()
                                .getDef(),
                            info.designer,
                            info.camera
                        );

                        SaveFile(JSON.stringify(data), circuitName);
                        break;
                }
            }} />
);

export const DigitalHeader = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ circuitName: state.circuit.name }),
    {  }
)(_DigitalHeader);





