package web

import (
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"strconv"
)

type StaticCache struct {
	cacheMap       map[string]string
	bustedNamesMap map[string]string
	bustedNames    []string
}

func bustedName(path string) string {
	return path + "?ver=" + strconv.FormatInt(getLastModifiedTime(path).Unix(), 10)
}

func NewStaticCache(files []string) (StaticCache, error) {
	cache := StaticCache{
		cacheMap:       make(map[string]string),
		bustedNamesMap: make(map[string]string),
		bustedNames:    make([]string, len(files)),
	}
	for i, a := range files {
		bName := bustedName(a)
		cache.bustedNamesMap[a] = bName
		cache.bustedNames[i] = bName

		bytes, err := ioutil.ReadFile(a)
		if err != nil {
			return StaticCache{}, err
		}
		cache.cacheMap[a] = string(bytes)
	}
	return cache, nil
}

func (s StaticCache) getBustedNames(names... string) []string {
	return s.getBustedNamesArr(names)
}

func (s StaticCache) getBustedNamesArr(names []string) []string {
	vals := make([]string, len(names))
	for i, n := range names {
		val, ok := s.bustedNamesMap[n]
		if !ok {
			log.Printf("Failed to find name for %s\n", n)
		}
		vals[i] = val
	}
	return vals

}

func (s StaticCache) registerRoutes(router *gin.Engine) {
	for f, b := range s.bustedNamesMap {
		router.GET(b, func(c *gin.Context) {
			log.Printf("Static file: %s\n", f)
			c.String(200, s.cacheMap[f])
		})
	}
}
