# Order of imports #
When importing code from other files make sure the imports maintain the following order

## EXTERNAL LIBRARIES: ##
        react
        redux
        serialeazy
        etc.
        

## CONSTANTS ##
    Any constants. For example, the constants from app/core/utils/Constants
## VECTOR ##   
    Always use import "Vector" instead of import "app/core/utils/math/Vector"

## MATH ##
    All files in the app/core/utils/math/ directory except for Vector
    Always use import "math/THE_FILE" instead of import "app/core/utils/math/THE_FILE"


## APP/CORE/ ##
**Files imported from the `app/core` directory should be orderd by subdirectory in the following order**
    
    UTILS
    ACTIONS
    TOOLS
    RENDERING
    MODELS
## APP/DIGITAL/ ##
**Files imported from the `app/digital` directory should be orderd by subdirectory in the following order**
    
    UTILS
    ACTIONS
    TOOLS
    RENDERING
    MODELS

## SITE/SHARED/ ##
**Files imported from the `site/shared` directory should be orderd by subdirectory in the following order**
    
    UTILS
    API
    STATE
    COMPONENTS
    CONTAINERS
## SITE/DIGITAL ##
**Files imported from the `site/digital` directory should be orderd by subdirectory in the following order**
    
    UTILS
    API
    STATE
    COMPONENTS
    CONTAINERS
    
## FILES IN THE SAME DIRECTORY STRUCTURE ##
    If none of the previous rules apply, as a general rule of thumb, files higher in the directory structure should be imported before files lower in the directory structre ex:
    "../../THE_FILE"
    "../THE_FILE"
    "./THE_FILE"

## JSON/DATA ##
    Any json files

## CSS ##
    Any css or scss files

## ALPHABETICAL ##
    If none of the previous rules apply, default to alphabetical order
    
# IMPORTANT #
    Files in the site/shared directory should never import from the digital directory
    Files in the app/core directory should never import from the app/digital directory
    Files in the app/ directory should never import from the site/ directory 

# EXAMPLE #
    import {createRef} from "react";

    import {InteractionTool}    from "shared/api/circuit/tools/InteractionTool";
    import {PanTool}            from "shared/api/circuit/tools/PanTool";
    import {RotateTool}         from "shared/api/circuit/tools/RotateTool";
    import {TranslateTool}      from "shared/api/circuit/tools/TranslateTool";
    import {WiringTool}         from "shared/api/circuit/tools/WiringTool";
    import {SplitWireTool}      from "shared/api/circuit/tools/SplitWireTool";
    import {SelectionBoxTool}   from "shared/api/circuit/tools/SelectionBoxTool";

    import {SelectAllHandler}     from "shared/api/circuit/tools/handlers/SelectAllHandler";
    import {FitToScreenHandler}   from "shared/api/circuit/tools/handlers/FitToScreenHandler";
    import {DuplicateHandler}     from "shared/api/circuit/tools/handlers/DuplicateHandler";
    import {DeleteHandler}        from "shared/api/circuit/tools/handlers/DeleteHandler";
    import {SnipWirePortsHandler} from "shared/api/circuit/tools/handlers/SnipWirePortsHandler";
    import {DeselectAllHandler}   from "shared/api/circuit/tools/handlers/DeselectAllHandler";
    import {SelectionHandler}     from "shared/api/circuit/tools/handlers/SelectionHandler";
    import {SelectPathHandler}    from "shared/api/circuit/tools/handlers/SelectPathHandler";
    import {UndoHandler}          from "shared/api/circuit/tools/handlers/UndoHandler";
    import {RedoHandler}          from "shared/api/circuit/tools/handlers/RedoHandler";
    import {CopyHandler}          from "shared/api/circuit/tools/handlers/CopyHandler";
    import {PasteHandler}         from "shared/api/circuit/tools/handlers/PasteHandler";

    import {CircuitMetadataBuilder} from "shared/api/circuit/models/CircuitMetadata";

    import {SetCircuitSaved} from "shared/site/state/CircuitInfo";

    import {ContextMenu}     from "shared/containers/ContextMenu";
    import {Header}          from "shared/containers/Header";
    import {SideNav}         from "shared/containers/SideNav";

    import {LoginPopup}           from "shared/containers/LoginPopup";
    import {SelectionPopup}       from "shared/containers/SelectionPopup";
    import {PositionModule}       from "shared/containers/SelectionPopup/modules/PositionModule";

    import {DigitalPaste} from "site/digital/utils/DigitalPaste";
    import {Setup}        from "site/digital/utils/CircuitInfo/Setup";

    import {AppStore} from "site/digital/state";

    import {DigitalItemNav}         from "site/digital/containers/DigitalItemNav";
    import {ICDesigner}             from "site/digital/containers/ICDesigner";
    import {ICViewer}               from "site/digital/containers/ICViewer";
    import {KeyboardShortcutsPopup} from "site/digital/containers/KeyboardShortcutsPopup";
    import {MainDesigner}           from "site/digital/containers/MainDesigner";
    import {QuickStartPopup}        from "site/digital/containers/QuickStartPopup";

    import {ViewICButtonModule}   from "site/digital/containers/SelectionPopup/modules/ViewICButtonModule";
    import {InputCountModule}     from "site/digital/containers/SelectionPopup/modules/InputCountModule";
    import {ColorModule}          from "site/digital/containers/SelectionPopup/modules/ColorModule";
    import {ClockFrequencyModule} from "site/digital/containers/SelectionPopup/modules/ClockFrequencyModule";
    import {OutputCountModule}    from "site/digital/containers/SelectionPopup/modules/OutputCountModule";
    import {SegmentCountModule}   from "site/digital/containers/SelectionPopup/modules/SegmentCountModule";
    import {TextColorModule}      from "site/digital/containers/SelectionPopup/modules/TextColorModule";
    import {BusButtonModule}      from "site/digital/containers/SelectionPopup/modules/BusButtonModule";
    import {CreateICButtonModule} from "site/digital/containers/SelectionPopup/modules/CreateICButtonModule";

    import exampleConfig from "site/digital/data/examples.json";

    import "./index.scss";
