

// This will be... somewhere else
export interface Action<Model extends OTModel> {
	Inverse(): Action<Model>;
	// Transform must be defined over _all_ transformations applicable to 
	//	the base model as well
	Transform(a: Action<OTModel>): void;
	Apply(m: Model): void;
}

// This will be... somewhere else
export interface OTModel {
}