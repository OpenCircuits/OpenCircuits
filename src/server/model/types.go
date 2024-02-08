package model

import "strconv"

type (
	// UserID is the unique identifier of a user
	UserID string
	// SchemaVersion is the client's model schema version
	SchemaVersion string
	// LinkID is a key for accessing another user's Circuit.
	LinkID string
	// CircuitID is the immutable ID of a circuit.
	CircuitID int64
)

// AnonUserID is the user ID given to all anonymous users.
//	This may change
const AnonUserID = "ANON"

func (u UserID) IsAnonymous() bool {
	return u == AnonUserID
}

func ParseCircuitID(s string) (CircuitID, error) {
	i, err := strconv.ParseInt(s, 16, 64)
	return CircuitID(i), err
}

func (id CircuitID) String() string {
	return strconv.FormatInt(int64(id), 16)
}

func (id *CircuitID) MarshalText() ([]byte, error) {
	return []byte(id.String()), nil
}

func (id *CircuitID) UnmarshalText(b []byte) error {
	i, err := ParseCircuitID(string(b))
	if err != nil {
		return err
	}
	*id = i
	return nil
}
