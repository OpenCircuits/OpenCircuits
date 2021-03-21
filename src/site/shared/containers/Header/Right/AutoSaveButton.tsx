import {connect} from "react-redux";
import {SharedAppState} from "shared/state";
import {SetAutoSave} from "shared/state/UserInfo/actions";

import "./index.scss"

type OwnProps = {

}

type StateProps = {
  isLoggedIn: boolean;
  isAutoSave: boolean;
}