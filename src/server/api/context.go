package api

import (
	"net/http"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/gin-gonic/gin"
)

// Context is an extended context with drivers for access and circuit
type Context struct {
	DB model.CircuitDB
	*gin.Context
}

// Identity extracts the requesting user's identity
func (c Context) Identity() model.UserID {
	ident, ok := c.Keys[Identity]
	if !ok {
		panic("Empty identity")
	}
	userID, ok := ident.(model.UserID)
	if !ok {
		panic("bad identity type")
	}
	return userID
}

func (c Context) NewCircuitHandle(param string) (CircuitHandle, error) {
	circuitID, err := model.ParseCircuitID(c.Param(param))
	if err != nil {
		return CircuitHandle{}, ErrInvalidID
	}
	linkID := model.LinkID(c.Query("l"))
	return NewCircuitHandle(c.DB, c.Identity(), circuitID, linkID), nil
}

// HandlerFunc is a request handler function that takes the extended context
type HandlerFunc = func(c *Context) (interface{}, error)

// Corresponds to errors in model
var errorMap = map[error]int{
	ErrInvalidID:         http.StatusBadRequest,
	ErrNotFound:          http.StatusNotFound,
	ErrUserCannotCreate:  http.StatusForbidden,
	ErrInsufficientPerms: http.StatusForbidden,
	ErrThumbnailSize:     http.StatusBadRequest,
	ErrContentSize:       http.StatusBadRequest,
	ErrDescSize:          http.StatusBadRequest,
	ErrVersionSize:       http.StatusBadRequest,
}

// Wrap wraps handlers for routes using extended context
func Wrap(handler HandlerFunc, db model.CircuitDBFactory, successCode int, failureCode int) gin.HandlerFunc {
	return func(c *gin.Context) {
		obj, err := handler(&Context{
			db.Create(),
			c,
		})

		if err != nil {
			code, ok := errorMap[err]
			if !ok {
				code = failureCode
			}
			c.JSON(code, gin.H{"error": err.Error()})
		} else {
			c.JSON(successCode, obj)
		}
	}
}
