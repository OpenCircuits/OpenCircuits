import { Action, ActionTransformer, OTModel } from "core/ot/Interfaces";
import { InsertAction } from "./MockModel";

// The TextModel is a text-based OT model
export class TextModel implements OTModel {
	public Text: string;
}

export type TextAction = Action<TextModel>;

export class InsertTextAction implements TextAction {
	public text: string;
	public position: number;

	public constructor(text: string, position: number) {
		this.text = text;
		this.position = position;
	}

	Inverse(): Action<TextModel> {
		return new DeleteTextAction(this.position, this.position + this.text.length, this.text);
	}
	Apply(m: TextModel): boolean {
		m.Text = m.Text.slice(0, this.position) + this.text + m.Text.slice(this.position);
		return true;
	}
}

// NOTE: This is a _little_ weird, because two overlapping concurrent deletes
//	will have overlapping tombstones, even if their ranges are corrected, so
//	undoing both actions will insert duplicate text of the overlap.
export class DeleteTextAction implements TextAction {
	public start: number;
	public end: number;
	public tombstone?: string;

	public constructor(start: number, end: number, tombstone?: string) {
		this.start = start;
		this.end = end;
		this.tombstone = tombstone;
	}

	Inverse(): Action<TextModel> {
		if (this.tombstone == undefined) {
			throw new Error("Cannot invert unapplied delete");
		}
		return new InsertTextAction(this.tombstone, this.start);
	}
	Apply(m: TextModel): boolean {
		if (this.start == this.end) {
			return false;
		}
		this.tombstone = m.Text.slice(this.start, this.end);
		m.Text =
			m.Text.slice(0, this.start) +
			m.Text.slice(this.end);
		return true;
	}
}

export class TextActionTransformer implements ActionTransformer<TextModel> {
	Transform(t: TextAction, f: TextAction): void {
		if (t instanceof InsertTextAction) {
			if (f instanceof InsertTextAction) {
				if (f.position <= t.position) {
					// other action is _before_ us, so offset by their length
					t.position += f.text.length;
				}
			} else if (f instanceof DeleteTextAction) {
				if (f.end < t.position) {
					// other action is fully before us, so offset by length
					t.position -= f.end - f.start;
				} else if (f.start < t.position) {
					// other action range contains insert position, so position where deletion does
					t.position = f.start;
				}
			} else {
				throw new Error("Unexpected action type");
			}
		}
		else if (t instanceof DeleteTextAction) {
			if (f instanceof InsertTextAction) {
				if (f.position <= t.start) {
					// other action is before us, so offset by their length
					t.start += f.text.length;
				}
			} else if (f instanceof DeleteTextAction) {
				if (f.end < t.start) {
					// other action is fully before us, so offset by length
					t.start -= f.end - f.start;
					t.end -= f.end - f.start;
				} else if (f.start < t.end) {
					// delete ranges intersect, so trim ours by theirs
					if (f.start <= t.start && f.end <= t.end) {
						// this is the right side of the range
						t.start = f.end;
					} else if (f.start > t.start && f.end > t.end) {
						// this is the left side of the range
						t.end = f.start;
					} else if (f.start <= t.start && f.end > t.end) {
						// this is fully consumed by the other range
						t.end = t.start = f.start;
					} else {
						// this fully consumes the other range
						t.end -= f.end - f.start;
					}
				}
			} else {
				throw new Error("Unexpected action type");
			}
		} else {
			throw new Error("Unexpected action type");
		}
	}
}