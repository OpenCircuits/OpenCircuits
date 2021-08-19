package model

import (
	"encoding/base64"

	"github.com/google/uuid"
)

type (
	UserID        string
	SchemaVersion string
)

const AnonUserID = "ANON"

type UUID struct {
	uuid.UUID
}

type CircuitID struct {
	UUID
}

type SessionID struct {
	UUID
}

type LinkID struct {
	UUID
}

func (u *UUID) Base64Decode(s string) error {
	circuitIDBytes, err := base64.URLEncoding.DecodeString(s)
	if err != nil {
		return err
	}
	return u.UnmarshalBinary(circuitIDBytes)
}

func (u UUID) Base64Encode() string {
	b, _ := u.MarshalBinary()
	return base64.URLEncoding.EncodeToString(b)
}

func NewUUID() UUID {
	return UUID{uuid.New()}
}

func NewCircuitID() CircuitID {
	return CircuitID{NewUUID()}
}

func NewLinkID() LinkID {
	return LinkID{NewUUID()}
}

func NewSessionID() SessionID {
	return SessionID{NewUUID()}
}
