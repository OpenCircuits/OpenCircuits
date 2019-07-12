package web

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

type Item struct {
	Id    string `json:"id"`
	Label string `json:"label"`
	Icon  string `json:"icon"`
	Not   bool   `json:"not"`
}

type Section struct {
	Id    string `json:"id"`
	Label string `json:"label"`
	Items []Item `json:"items"`
}

type NavConfig struct {
	Sections []Section `json:"sections"`
}

var navConfig NavConfig

func init() {
	// Load the sections from the json file TODO: don't cache this (or make a way to make it dirty)
	file, err := ioutil.ReadFile("./data/itemnavconfig.json")
	if err != nil {
		log.Printf("File error: %v\n", err)
		os.Exit(1)
	}
	err = json.Unmarshal(file, &navConfig)
	if err != nil {
		log.Printf("Failed to unmarshall json: %v\n", err)
		os.Exit(1)
	}
}

func getLastModifiedTime(path string) time.Time {
	file, err := os.Stat(path)
	if err != nil {
		log.Printf("Invalid file path %s\n", path)
		return time.Now()
	}
	return file.ModTime()
}

func getBustedName(path string) string {
	return path + "?ver=" + strconv.FormatInt(getLastModifiedTime(path).Unix(), 10)
}

func indexHandler(c *gin.Context) {
	c.HTML(http.StatusOK, "index.tmpl", gin.H{"navConfig": navConfig, "l": false, "user_id": "" ,
		"bundleJs": getBustedName("./Bundle.js")})
}

func noCacheHandler(path string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.File(path)
	}
}
