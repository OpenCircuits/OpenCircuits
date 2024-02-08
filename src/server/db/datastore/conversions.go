package datastore

import (
	"sort"

	"github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/v0_1"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

func v0_1_ToListing(c v0_1.Circuit, id model.CircuitID) model.CircuitListing {
	return model.CircuitListing{
		ID:        id,
		Name:      c.Name,
		Desc:      c.Desc,
		Version:   model.SchemaVersion(c.Version),
		Thumbnail: c.Thumbnail,
	}
}

func v0_1_FromCircuit(c model.Circuit) (v0_1.Circuit, []v0_1.ContentChunk) {
	// Split into chunks
	chunkCount := len(c.Content)/v0_1.ContentChunkLimit + 1
	chunks := make([]v0_1.ContentChunk, chunkCount)
	for i := range chunks {
		lim := (i + 1) * v0_1.ContentChunkLimit
		if i == chunkCount-1 {
			lim = len(c.Content)
		}
		chunks[i] = v0_1.ContentChunk{
			Seq:     i,
			Content: c.Content[i*v0_1.ContentChunkLimit : lim],
		}
	}
	return v0_1.Circuit{
		Name:      c.Metadata.Name,
		Desc:      c.Metadata.Desc,
		Version:   string(c.Metadata.Version),
		Thumbnail: c.Metadata.Thumbnail,
	}, chunks
}

func v0_1_ToCircuit(c v0_1.Circuit, chunks []v0_1.ContentChunk) model.Circuit {
	sort.Slice(chunks, func(i, j int) bool {
		return chunks[i].Seq < chunks[j].Seq
	})
	var content string
	for _, chunk := range chunks {
		content += chunk.Content
	}
	return model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      c.Name,
			Desc:      c.Desc,
			Version:   model.SchemaVersion(c.Version),
			Thumbnail: c.Thumbnail,
		},
		Content: content,
	}
}

func v0_1_FromPerms(perms model.CircuitPermissions) v0_1.Permissions {
	return v0_1.Permissions{
		LinkID:   string(perms.LinkID),
		LinkPerm: int(perms.LinkPerm),
		Owner:    string(perms.Owner),
	}
}

func v0_1_ToPerms(perms v0_1.Permissions) model.CircuitPermissions {
	return model.CircuitPermissions{
		LinkID:   model.LinkID(perms.LinkID),
		LinkPerm: model.AccessLevel(perms.LinkPerm),
		Owner:    model.UserID(perms.Owner),
	}
}
