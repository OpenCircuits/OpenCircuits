package model

import (
	"encoding/base64"

	"github.com/google/uuid"
)

type (
	// UserID is the unique identifier of a user
	UserID string
	// SchemaVersion is the client's model schema version
	SchemaVersion string
)

// UUID is a wrapper around the default UUID class
type UUID struct {
	uuid.UUID
}

// CircuitID is a UUID that refers to an entire circuit
type CircuitID struct {
	UUID
}

// SessionID is a UUID that identifies a client session
type SessionID struct {
	UUID
}

// LinkID is a UUID that identifies a share link with specific permissions
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
