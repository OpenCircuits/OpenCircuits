package mem

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

// persistence is a helper type for saving the in-memory DB to disk for convenience
type persistence struct {
	path string
}

func (p persistence) save(v interface{}) {
	if len(p.path) == 0 {
		return
	}
	data, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	if err := ioutil.WriteFile(p.path, data, 0644); err != nil {
		panic(err)
	}
}

func (p persistence) load(v interface{}) {
	if len(p.path) == 0 {
		return
	}
	data, err := ioutil.ReadFile(p.path)
	if err != nil {
		fmt.Printf("Failed to load \"mem\" data from %s: %e\n", p.path, err)
		return
	}
	if err := json.Unmarshal(data, v); err != nil {
		panic(err)
	}
}
