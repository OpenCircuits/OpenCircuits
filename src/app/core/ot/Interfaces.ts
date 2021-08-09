

// This will be... somewhere else
export interface OTModel {
}

// This will be... somewhere else
export interface Action<Model extends OTModel> {
    Inverse(): Action<Model>;
    // Apply needs to return whether the action is applied successfully so
    //	if it isn't, then it doesn't get added to the history and is never
    //	inverted.  Inverting an unsuccessful delete operation can be problematic.
    Apply(m: Model): boolean;
}

// Transform must be defined over _all_ pairs of actions in a schema.
//	Use separate class to avoid complete graph of dependencies.
export interface ActionTransformer<M extends OTModel> {
    // Transform t by f so the log would go from 
    //		[..., x, t, ...] to [..., x, f, t, ...]
    Transform(t: Action<M>, f: Action<M>): void;
}
