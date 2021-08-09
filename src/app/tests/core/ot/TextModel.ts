import { Action, OTModel } from "core/ot/Interfaces";

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
	Transform(a: Action<OTModel>): void {
		if (a instanceof InsertTextAction) {
			if (a.position <= this.position) {
				// other action is _before_ us, so offset by their length
				this.position += a.text.length;
			}
		} else if (a instanceof DeleteTextAction) {
			if (a.end < this.position) {
				// other action is fully before us, so offset by length
				this.position -= a.end - a.start;
			} else if (a.start < this.position) {
				// other action range contains insert position, so position where deletion does
				this.position = a.start;
			}
		} else {
			throw new Error("Unexpected action type");
		}
	}
	Apply(m: TextModel): void {
		m.Text = m.Text.slice(0, this.position) + this.text + m.Text.slice(this.position);
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
	Transform(a: Action<OTModel>): void {
		if (a instanceof InsertTextAction) {
			if (a.position <= this.start) {
				// other action is before us, so offset by their length
				this.start += a.text.length;
			}
		} else if (a instanceof DeleteTextAction) {
			if (a.end < this.start) {
				// other action is fully before us, so offset by length
				this.start -= a.end - a.start;
				this.end -= a.end - a.start;
			} else if (a.start < this.end) {
				// delete ranges intersect, so trim ours by theirs
				if (a.start <= this.start && a.end <= this.end) {
					// this is the right side of the range
					this.start = a.end;
				} else if (a.start > this.start && a.end > this.end) {
					// this is the left side of the range
					this.end = a.start;
				} else if (a.start <= this.start && a.end > this.end) {
					// this is fully consumed by the other range
					this.end = this.start = a.start;
				} else {
					// this fully consumes the other range (so do nothing)
				}
			}
		} else {
			throw new Error("Unexpected action type");
		}
	}
	Apply(m: TextModel): void {
		this.tombstone = m.Text.slice(this.start, this.end);
		m.Text =
			m.Text.slice(0, this.start) +
			m.Text.slice(this.end);
	}
}