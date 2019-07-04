package core

// Process-wide globals.  Use sparingly

var csif *CircuitStorageInterfaceFactory
func GetCircuitStorageInterfaceFactory() CircuitStorageInterfaceFactory {
	return *csif
}

func SetCircuitStorageInterfaceFactory(c CircuitStorageInterfaceFactory) {
	csif = &c
}
