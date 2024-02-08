package common

import (
	"context"

	"cloud.google.com/go/datastore"
)

type DatastoreDB struct {
	Client *datastore.Client
	Ctx    context.Context
}
