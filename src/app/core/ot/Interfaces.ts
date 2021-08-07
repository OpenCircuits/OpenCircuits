

// This will be... somewhere else
export interface Action {
	Inverse(): Action;
	Transform(a: Action): void;
}

// This will be... somewhere else
export interface OTModel {
	Apply(a: Action): void;
}