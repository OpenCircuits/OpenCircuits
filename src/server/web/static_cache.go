package web

import (
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"strconv"
)

// A cache for static resources
type StaticCache interface {
	GetBustedNames(name... string) []string
	GetBustedNamesArr(name []string) []string
	RegisterRoutes(r *gin.Engine)
}

func BustedName(path string) string {
	return path + "?ver=" + strconv.FormatInt(getLastModifiedTime(path).Unix(), 10)
}

func LookupMulti(m0 map[string]string, ks []string) []string {
	vals := make([]string, len(ks))
	for i, n := range ks {
		vals[i] = m0[n]
	}
	return vals
}

// Debug cache that always loads files from the disc
type debugCache struct {
	bustedNamesMap map[string]string
	bustedNames    []string
}

func NewDebugCache(files []string) (StaticCache, error) {
	cache := debugCache{
		bustedNamesMap: make(map[string]string),
		bustedNames:    make([]string, len(files)),
	}
	for i, a := range files {
		bName := BustedName(a)
		cache.bustedNamesMap[a] = bName
		cache.bustedNames[i] = bName
	}
	return cache, nil
}

func (s debugCache) GetBustedNames(names ...string) []string {
	return s.GetBustedNamesArr(names)
}

func (s debugCache) GetBustedNamesArr(names []string) []string {
	return LookupMulti(s.bustedNamesMap, names)
}

func (s debugCache) RegisterRoutes(router *gin.Engine) {
	for f, b := range s.bustedNamesMap {
		router.GET(b, func(c *gin.Context) {
			c.File(f)
		})
	}
}

// Static cache which loads all static resources into memory at startup
type FixedCache struct {
	cacheMap       map[string]string
	bustedNamesMap map[string]string
	bustedNames    []string
}

func NewFixedCache(files []string) (StaticCache, error) {
	cache := FixedCache{
		cacheMap:       make(map[string]string),
		bustedNamesMap: make(map[string]string),
		bustedNames:    make([]string, len(files)),
	}
	for i, a := range files {
		bName := BustedName(a)
		cache.bustedNamesMap[a] = bName
		cache.bustedNames[i] = bName

		bytes, err := ioutil.ReadFile(a)
		if err != nil {
			return FixedCache{}, err
		}
		cache.cacheMap[a] = string(bytes)
	}
	return cache, nil
}

func (s FixedCache) GetBustedNames(names ...string) []string {
	return s.GetBustedNamesArr(names)
}

func (s FixedCache) GetBustedNamesArr(names []string) []string {
	return LookupMulti(s.bustedNamesMap, names)
}

func (s FixedCache) RegisterRoutes(router *gin.Engine) {
	for f, b := range s.bustedNamesMap {
		router.GET(b, func(c *gin.Context) {
			c.String(200, s.cacheMap[f])
		})
	}
}
