package core

import "github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"

// Process-wide globals.  Use sparingly

var csif *interfaces.CircuitStorageInterfaceFactory
func GetCircuitStorageInterfaceFactory() interfaces.CircuitStorageInterfaceFactory {
	return *csif
}

func SetCircuitStorageInterfaceFactory(c interfaces.CircuitStorageInterfaceFactory) {
	csif = &c
}
