package utils

import (
	"crypto/rand"
	"encoding/base64"
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

func Rand(l int) []byte {
	b := make([]byte, l)
	n, err := rand.Read(b)
	if err != nil {
		panic(err)
	}
	if n != l {
		panic(errors.New("error generating random token; size created did not match size requested"))
	}
	return b
}

func randToken(encoding *base64.Encoding, l int) string {
	return encoding.EncodeToString(Rand(l))
}

// RandToken Generates a random b64 string with the specified entropy
func RandToken(l int) string {
	return randToken(base64.StdEncoding, l)
}

func GenFreshCircuitId(c func(_ model.CircuitId) bool) model.CircuitId {
	id := randToken(base64.URLEncoding, 32)
	for !c(id) {
		id = randToken(base64.URLEncoding, 32)
	}
	return id
}
