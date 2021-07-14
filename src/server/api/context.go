package api

import (
	"fmt"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/gin-gonic/gin"
)

// Extended context with drivers
type Context struct {
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
func Wrap(circuits interfaces.CircuitStorageInterfaceFactory, handler HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		code, obj := handler(&Context{
			circuits,
			c,
		})

		// Cast errors specially, and omit them in release mode
		if err, ok := obj.(error); ok {
			debug := true
			if code/100 == 5 && !debug {
				obj = nil
			} else {
				fmt.Printf("Error: %#v\n", err)
				obj = gin.H{"error": err.Error()}
			}
		}
		c.JSON(code, obj)
	}
}
