package api

import (
	"github.com/OpenCircuits/OpenCircuits/site/go/access"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/gin-gonic/gin"
)

// Extended context with drivers for access and circuit
type Context struct {
	Access   access.DataDriver
	Circuits interfaces.CircuitStorageInterfaceFactory
	*gin.Context
}

func (c Context) Identity() string {
	ident := c.Request.Header.Get(Identity)
	if len(ident) == 0 {
		panic("Empty identity")
	}
	return ident
}

type HandlerFunc = func(c *Context)

func Wrap(access access.DataDriver, circuits interfaces.CircuitStorageInterfaceFactory, handler HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		handler(&Context{
			access,
			circuits,
			c,
		})
	}
}
