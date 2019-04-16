package db

type StringStoreEntry struct {
	Key, Value string
}

type StringStore interface {
	StoreString(key string, value string) error
	LoadString(key string) (StringStoreEntry, error)
}
