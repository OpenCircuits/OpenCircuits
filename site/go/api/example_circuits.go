package api

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/gin-gonic/gin"
	"net/http"
)

func getExampleCircuitHandler(csif interfaces.CircuitStorageInterfaceFactory) func(c *gin.Context) {
	return func(c *gin.Context) {
		exampleID := c.Param("id")

		circuitInterface := csif.CreateCircuitStorageInterface()

		loadedCircuit := circuitInterface.LoadCircuit(exampleID)
		if loadedCircuit == nil {
			c.XML(http.StatusNotFound, nil)
			return
		}

		c.Header("Content-Type", "text/xml")
		c.String(http.StatusOK, loadedCircuit.Designer.RawContent)
	}
}
