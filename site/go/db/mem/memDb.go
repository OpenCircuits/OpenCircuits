package mem

import (
	"errors"
	"github.com/OpenCircuits/OpenCircuits/site/go/db"
)

type memDb struct {
	m map[string]db.StringStoreEntry
}

func NewMemDb() db.StringStore {
	return memDb{m: make(map[string]db.StringStoreEntry)}
}

func (d memDb) StoreString(key string, value string) error {
	v, ok := d.m[key]
	if !ok {
		v = db.StringStoreEntry{Key: key}
	}
	v.Value = value
	d.m[key] = v
	return nil
}

func (d memDb) LoadString(key string) (db.StringStoreEntry, error) {
	v, ok := d.m[key]
	if !ok {
		return v, errors.New("invalid key")
	}
	return v, nil
}