package storage

import (
	"encoding/json"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"io/ioutil"
)

type exampleCircuitStorageInterfaceFactory struct {
	// Internally uses the memory interface
	memInterfaceFactory interfaces.CircuitStorageInterfaceFactory
	configPath          string
}

// ExampleCircuit is a representation of the example circuit in a config
type exampleCircuit struct {
	Name      string `json:"name"`
	File      string `json:"file"`
	Thumbnail string `json:"thumbnail"`
}

// ExamplesConfig is a representation of the config for examples
type examplesConfig struct {
	Examples []exampleCircuit `json:"examples"`
}

// NewExampleCircuitStorageInterfaceFactory creates a new CircuitStorageInterfaceFactory for a config file backed circuit
//	storage that gets cached once on creation.  This could be extended to support persistence.
func NewExampleCircuitStorageInterfaceFactory(configPath string) interfaces.CircuitStorageInterfaceFactory {
	fs := exampleCircuitStorageInterfaceFactory{
		memInterfaceFactory: NewMemStorageInterfaceFactory(),
		configPath:          configPath,
	}

	// Load the example circuits into memory
	// Since we don't expect an absurd number of them and/or absurdly large circuits
	// Also good since retrieving the example circuits is done every time
	//  the page is refreshed and should be fast and efficient
	file, err := ioutil.ReadFile(fs.configPath)
	core.CheckErrorMessage(err, "File error:")

	var examplesConfig examplesConfig
	err = json.Unmarshal(file, &examplesConfig)
	core.CheckErrorMessage(err, "Failed to unmarshall json:")

	circuitInterface := fs.memInterfaceFactory.CreateCircuitStorageInterface()
	for _, example := range examplesConfig.Examples {
		contents, err := ioutil.ReadFile("./examples/" + example.File)
		core.CheckErrorMessage(err, "File read error:")

		circuit := circuitInterface.NewCircuit()
		circuit.Metadata = model.CircuitMetadata{
			ID:        circuit.Metadata.ID,
			Name:      example.Name,
			Owner:     "example",
			Desc:      "example",
			Thumbnail: example.Thumbnail,
		}
		circuit.Designer.RawContent = string(contents)
		circuitInterface.UpdateCircuit(circuit)
	}

	return &fs
}

func (fs *exampleCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() interfaces.CircuitStorageInterface {
	return fs.memInterfaceFactory.CreateCircuitStorageInterface()
}
