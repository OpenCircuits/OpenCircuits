package api

import (
	"encoding/json"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"net/http"
	"strconv"
)

/******************************************************************************
 * LEON'S NEW STUFF - FEEL FREE TO MOVE, I DONT KNOW GO VERY WELL
 */
type Circuit struct {
	Id        string
	Name      string
	Desc      string
    Thumbnail string
	Contents  string
}

type ExampleCircuit struct {
	Name      string `json:"name"`
	File      string `json:"file"`
    Thumbnail string `json:"thumbnail"`
}

type ExamplesConfig struct {
	Examples []ExampleCircuit `json:"examples"`
}

/*
 ******************************************************************************
 */

var exampleCircuits []Circuit

func init() {
	// Load the example circuits into memory
	// Since we don't expect an absurd number of them and/or absurdly large circuits
	// Also good since retrieving the example circuits is done every time
	//  the page is refreshed and should be fast and efficient
	file, err := ioutil.ReadFile("./examples/examples.json")
	core.CheckErrorMessage(err, "File error:")

	var examplesConfig ExamplesConfig
	err = json.Unmarshal(file, &examplesConfig)
	core.CheckErrorMessage(err, "Failed to unmarshall json:")

	exampleCircuits = make([]Circuit, len(examplesConfig.Examples))
	for i := 0; i < len(exampleCircuits); i++ {
		contents, err := ioutil.ReadFile("./examples/" + examplesConfig.Examples[i].File)
		core.CheckErrorMessage(err, "File read error:")

		exampleCircuits[i] = Circuit{
			Id:        strconv.Itoa(i),
			Name:      examplesConfig.Examples[i].Name,
			Desc:      "example",
            Thumbnail: examplesConfig.Examples[i].Thumbnail,
			Contents:  string(contents),
		}
	}
}

func GetExamples() []Circuit {
	return exampleCircuits
}

func getExampleCircuitHandler(c *gin.Context) {
	exampleId := c.Param("id")

	i, err := strconv.Atoi(exampleId)
	if err != nil {
		c.XML(http.StatusForbidden, nil)
		return
	}

	// The circuit's ID is simply its index
	if i < 0 || i >= len(exampleCircuits) {
		c.XML(http.StatusNotFound, nil)
		return
	}

	c.Header("Content-Type", "text/xml")
	c.String(http.StatusOK, exampleCircuits[i].Contents)
}
