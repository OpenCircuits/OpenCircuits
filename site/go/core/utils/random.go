package utils

import (
	"crypto/rand"
	"encoding/base64"
)

func RandToken(l int) string {
	b := make([]byte, l)
	rand.Read(b)
	return base64.StdEncoding.EncodeToString(b)
}
