package conn

import (
	"encoding/json"
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
	"github.com/fatih/structs"
)

//
// Types in this file are mirrored in ot/Protocol.ts
//

//
// Message sent TO the client
//

type (
	ProposeAck     = doc.ProposeAck
	WelcomeMessage = doc.WelcomeMessage
	CloseMessage   = doc.CloseMessage
)

type NewEntries struct {
	Entries []doc.AcceptedEntry
}

const (
	ProposeAckType     = "ProposeAck"
	WelcomeMessageType = "WelcomeMessage"
	NewEntriesType     = "NewEntries"
	CloseMessageType   = "CloseMessage"
)

func Serialize(s interface{}) ([]byte, error) {
	var t string
	if _, ok := s.(ProposeAck); ok {
		t = ProposeAckType
	} else if _, ok := s.(WelcomeMessage); ok {
		t = WelcomeMessageType
	} else if _, ok := s.(NewEntries); ok {
		t = NewEntriesType
	} else if _, ok := s.(CloseMessage); ok {
		t = CloseMessageType
	} else {
		return nil, errors.New("serialized invalid type (INTERNAL PROTOCOL VIOLATION)")
	}

	m := structs.Map(s)
	m["_type_"] = t
	r, _ := json.Marshal(m)
	return r, nil
}

//
// Messages sent FROM the client
//

type (
	ProposeEntry = doc.ProposedEntry
	JoinDocument = doc.JoinDocument
)

const (
	ProposeEntryType = "ProposeEntry"
	JoinDocumentType = "JoinDocument"
)

func Deserialize(data []byte) (interface{}, error) {
	var objmap map[string]json.RawMessage
	if err := json.Unmarshal(data, &objmap); err != nil {
		return nil, err
	}

	var t string
	if err := json.Unmarshal(objmap["_type_"], &t); err != nil {
		return nil, err
	}

	var message interface{}
	var err error
	if t == ProposeEntryType {
		var m ProposeEntry
		err = json.Unmarshal(data, &m)
		message = m
	} else if t == JoinDocumentType {
		var m JoinDocument
		err = json.Unmarshal(data, &m)
		message = m
	} else {
		err = errors.New("received invalid message kind: " + t)
	}

	return message, err
}
