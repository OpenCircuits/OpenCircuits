package handlers

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/gin-gonic/contrib/sessions"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"net/http"
)

func CircuitStoreHandler(c *gin.Context) {
	session := sessions.Default(c)
	var userId string
	maybeUserId := session.Get("user-id")
	if maybeUserId != nil {
		userId = maybeUserId.(string)
	} else {
		c.XML(http.StatusForbidden, nil)
		return
	}

	circuitId := c.Param("id")
	contents, err := model.LoadCircuit(circuitId)
	if err != nil {
		contents = model.NewCircuit(circuitId, userId)
	} else {
		// Only owner can access... for now
		if contents.Metadata.Owner != userId {
			c.XML(http.StatusNotFound, nil)
			return
		}
	}

	x, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.XML(http.StatusInternalServerError, nil)
		return
	}

	contents.Content = string(x)
	contents.Save()

	c.XML(http.StatusOK, nil)
}

func CircuitLoadHandler(c *gin.Context) {
	session := sessions.Default(c)
	var userId string
	maybeUserId := session.Get("user-id")
	if maybeUserId != nil {
		userId = maybeUserId.(string)
	} else {
		c.XML(http.StatusForbidden, nil)
		return
	}

	circuitId := c.Param("id")

	contents, err := model.LoadCircuit(circuitId)
	if err != nil {
		c.XML(http.StatusNotFound, nil)
	} else {
		// Only owner can access... for now
		if contents.Metadata.Owner != userId {
			c.XML(http.StatusNotFound, nil)
			return
		}
	}
	c.Header("Content-Type", "application/xml")
	c.String(http.StatusOK, contents.Content)
}
