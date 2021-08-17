import { ClientInfoProvider } from "core/ot/OTDocument";

export class MockClientInfoProvider implements ClientInfoProvider {
    UserID(): string {
        return "FAKE_ID";
    }
    SchemaVersion(): string {
        return "3.0";
    }
}

export class MockAuthProvider {
    AuthType(): string {
        return "no_auth";
    }
    AuthID(): string {
        return "FAKE_ID";
    }
}