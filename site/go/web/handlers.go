package web

import (
	"encoding/json"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"os"
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

func IndexHandler(c *gin.Context) {
	session := sessions.Default(c)
	userId := session.Get("user-id")
	loggedIn := userId != nil

	c.HTML(http.StatusOK, "index.tmpl", gin.H{"navConfig": navConfig, "l": loggedIn, "userId": userId, "login_link": "/login"})
}
