package v0_1

import (
	v0 "github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/v0"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

func Migrate(c v0.DatastoreCircuit) FullCircuit {
	return FullCircuit{
		Circuit: Circuit{
			Name:      c.Name,
			Desc:      c.Desc,
			Version:   c.Version,
			Thumbnail: c.Thumbnail,
		},
		Permissions: Permissions{
			LinkID:   "",
			LinkPerm: int(model.AccessNone),
			Owner:    c.Owner,
		},
		// All v0 circuits have <1MB content
		Content: []ContentChunk{{
			Seq:     1,
			Content: c.CircuitDesigner,
		}},
	}
}
