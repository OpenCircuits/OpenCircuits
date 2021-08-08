

// This will be... somewhere else
export interface Action {
	Inverse(): Action;
	Transform(a: Action): void;
	Apply(m: OTModel): void;
}

// This will be... somewhere else
export interface OTModel {
}