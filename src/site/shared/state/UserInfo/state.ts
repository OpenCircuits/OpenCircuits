import {CircuitMetadata} from "core/models/CircuitMetadata";
import {AuthState} from "shared/api/auth/AuthState";


export type UserInfoState = {
    auth: AuthState;
    isLoggedIn: boolean;
    circuits: CircuitMetadata[];
    loading: boolean;
    error: string;
    autoSave: boolean;
}
