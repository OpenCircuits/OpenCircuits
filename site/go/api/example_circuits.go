package api

import (
	"encoding/base64"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
)

var exampleCircuitRegExp *regexp.Regexp
func init() {
	// restrictive, but easy
	r, err := regexp.Compile("[^a-zA-Z0-9_.]+")
	if err != nil {
		log.Fatal(err)
	}
	exampleCircuitRegExp = r
}

func getExampleCircuitHandler(c *gin.Context) {
	exampleIdb64 := c.Param("id")

	// The circuit's ID is simply its file name, but b64 encoded
	exampleId, err := base64.StdEncoding.DecodeString(exampleIdb64)
	if err != nil {
		c.XML(http.StatusBadRequest, err)
	}

	sanitizedId := exampleCircuitRegExp.ReplaceAllString(string(exampleId), "")

	contents, err := ioutil.ReadFile("examples/" + sanitizedId)
	if err != nil {
		c.XML(http.StatusNotFound, nil)
		return
	}

	c.Header("Content-Type", "text/xml")
	c.String(http.StatusOK, string(contents))
}

func getExampleCircuitListHandler(c *gin.Context) {
	var exampleNames []string

	err := filepath.Walk("examples",
		func(path string, info os.FileInfo, err error) error {
			// Only show the files that will be accepted by the loader function
			if exampleCircuitRegExp.MatchString(info.Name()) {
				exampleNames = append(exampleNames, info.Name())
			}
			return nil
		})

	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
	}

	c.JSON(http.StatusOK, exampleNames)
}
