

// This will be... somewhere else
export interface Action<Model extends OTModel> {
	Inverse(): Action<Model>;
	Transform(a: Action<Model>): void;
	Apply(m: Model): void;
}

// This will be... somewhere else
export interface OTModel {
}