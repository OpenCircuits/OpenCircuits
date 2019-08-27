package api

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func getExampleCircuitHandler(csif interfaces.CircuitStorageInterfaceFactory) func(c *gin.Context) {
	return func(c *gin.Context) {
		exampleID := c.Param("id")

		i, err := strconv.ParseInt(exampleID, 10, 64)
		if err != nil {
			c.XML(http.StatusBadRequest, nil)
			return
		}

		circuitInterface := csif.CreateCircuitStorageInterface()

		loadedCircuit := circuitInterface.LoadCircuit(i)
		if loadedCircuit == nil {
			c.XML(http.StatusNotFound, nil)
		}

		c.Header("Content-Type", "text/xml")
		c.String(http.StatusOK, loadedCircuit.Designer.RawContent)
	}
}
