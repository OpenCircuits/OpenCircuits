import { ClientInfoProvider } from "core/ot/Document";

export class MockClientInfoProvider implements ClientInfoProvider {
	UserID(): string {
		return "FAKE_ID";
	}
	SchemaVersion(): string {
		return "3.0";
	}
}