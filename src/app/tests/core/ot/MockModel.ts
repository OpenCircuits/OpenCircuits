import { Action, OTModel } from "core/ot/Interfaces";

export class MockModel implements OTModel {
	public Elements: Map<string, number> = new Map<string, number>();
}

export type MockAction = Action<MockModel>;

export class InsertAction implements MockAction {
	public key: string;
	public value: number;

	public constructor(key: string, value: number) {
		this.key = key;
		this.value = value;
	}

	Inverse(): Action<MockModel> {
		return new DeleteAction(this.key, this.value);
	}
	Transform(a: Action<OTModel>): void {
		// Some non-no-op transform behavior so it can be tested
		if (a instanceof InsertAction) {
			if (a.key == this.key) {
				this.key += "+";
			}
		}
	}
	Apply(m: MockModel): void {
		m.Elements.set(this.key, this.value);
	}

}

export class DeleteAction implements MockAction {
	public key: string;
	public tombstone?: number;

	public constructor(key: string, tombstone?: number) {
		this.key = key;
		this.tombstone = tombstone;
	}

	Inverse(): Action<MockModel> {
		if (this.tombstone == undefined) {
			throw new Error("Cannot invert delete without tombstone");
		}
		return new InsertAction(this.key, this.tombstone);
	}
	Transform(a: Action<OTModel>): void { }

	// TODO: "Apply" needs to indicate if the action _did_ anything, because if
	//	it didn't, then it can't be inverted.
	Apply(m: MockModel): void {
		this.tombstone = m.Elements.get(this.key);
		m.Elements.delete(this.key);
	}

}