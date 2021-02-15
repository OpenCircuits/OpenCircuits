import {Deserialize} from "serialeazy";
import {connect} from "react-redux";

import {OVERWRITE_CIRCUIT_MESSAGE} from "site/digital/utils/Constants";

import {Circuit, ContentsData} from "core/models/Circuit";
import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalCircuitDesigner} from "digital/models";

import {SaveFile} from "shared/utils/Exporter";
import {LoadFile} from "shared/utils/Importer";
import {SavePDF, SavePNG} from "shared/utils/ImageExporter";
import {Header} from "shared/containers/Header";
import {SharedAppState} from "shared/state";
import {SetCircuitName} from "shared/state/CircuitInfo/actions";

import {GenerateThumbnail} from "site/digital/utils/GenerateThumbnail";


type OwnProps = {
    canvas: React.MutableRefObject<HTMLCanvasElement>;
    info: DigitalCircuitInfo;
}
type StateProps = {
    circuitName: string;
    isSaved: boolean;
}
type DispatchProps = {
    SetCircuitName: typeof SetCircuitName;
}

type Props = StateProps & DispatchProps & OwnProps;
const _DigitalHeader = ({canvas, info, isSaved, circuitName, SetCircuitName}: Props) => (
    <Header img="img/icons/logo.svg"


            onLoad={async (f) => {
                // Prompt to load
                const open = isSaved || confirm(OVERWRITE_CIRCUIT_MESSAGE);
                if (!open)
                    return;

                const {camera, history, designer, selections, renderer} = info;

                // Load circuit and metadata
                const contents = await LoadFile(f);
                const circuit = JSON.parse(contents) as Circuit;

                const data = Deserialize<ContentsData>(circuit.contents);

                // Load camera, reset selections, clear history, and replace circuit
                camera.setPos(data.camera.getPos());
                camera.setZoom(data.camera.getZoom());

                selections.get().forEach(s => selections.deselect(s));

                history.reset();

                designer.replace(data.designer as DigitalCircuitDesigner);

                renderer.render();

                SetCircuitName(circuit.metadata.name);
            }}


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
    (state) => ({ isSaved: state.circuit.isSaved, circuitName: state.circuit.name }),
    { SetCircuitName }
)(_DigitalHeader);





