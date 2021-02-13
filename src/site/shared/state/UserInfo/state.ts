import {CircuitMetadata} from "core/models/CircuitMetadata";

export type UserInfoState = {
    auth: string;
    isLoggedIn: boolean;
    circuits: CircuitMetadata[];
}
