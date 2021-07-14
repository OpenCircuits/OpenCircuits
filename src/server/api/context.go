package api

import (
	"fmt"

	"github.com/OpenCircuits/OpenCircuits/site/go/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
)

// Extended context with drivers for access and circuit
type Context struct {
	Access   access.DataDriver
	Circuits interfaces.CircuitStorageInterfaceFactory
	*gin.Context
}

// Extract the requesting user's identity
func (c Context) Identity() model.UserId {
	ident := c.Request.Header.Get(Identity)
	if len(ident) == 0 {
		panic("Empty identity")
	}
	return ident
}

type HandlerFunc = func(c *Context) (int, interface{})

// Wrapper for routes using extended context
func Wrap(access access.DataDriver, circuits interfaces.CircuitStorageInterfaceFactory, handler HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		code, obj := handler(&Context{
			access,
			circuits,
			c,
		})

		// Cast errors specially
		if err, ok := obj.(error); ok {
			if code/100 == 5 {
				// Any 500-type errors that make it this far are logged instead
				fmt.Printf("Error: %s\n", err.Error())
				obj = nil
			} else {
				obj = gin.H{"error": err.Error()}
			}
		}
		c.JSON(code, obj)
	}
}
