package session

import (
	"encoding/json"
	"errors"
	"log"

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
	ProposeNack    = doc.ProposeNack
	WelcomeMessage = doc.WelcomeMessage
)

type NewEntries struct {
	Entries []doc.AcceptedEntry
}

const (
	ProposeAckKind     = "propose_ack"
	ProposeNackKind    = "propose_nack"
	WelcomeMessageKind = "welcome_entry"
	NewEntriesKind     = "new_entries"
)

func Serialize(s interface{}) []byte {
	var kind string
	if _, ok := s.(ProposeAck); ok {
		kind = ProposeAckKind
	} else if _, ok := s.(ProposeNack); ok {
		kind = ProposeNackKind
	} else if _, ok := s.(WelcomeMessage); ok {
		kind = WelcomeMessageKind
	} else if _, ok := s.(doc.AcceptedEntry); ok {
		kind = NewEntriesKind
	} else {
		kind = "server_error_invalid_type"
		log.Println("INTERNAL PROTOCOL VIOLATION: serialized invalid type")
	}

	m := structs.Map(s)
	m["kind"] = kind
	r, _ := json.Marshal(m)
	return r
}

//
// Messages sent FROM the client
//

type (
	ProposeEntry = doc.ProposedEntry
	JoinDocument = doc.JoinDocument
)

const (
	ProposeEntryKind = "propose"
	JoinDocumentKind = "join_document"
)

func Deserialize(data []byte) (interface{}, error) {
	var objmap map[string]json.RawMessage
	if err := json.Unmarshal(data, &objmap); err != nil {
		return nil, err
	}

	var kind string
	if err := json.Unmarshal(objmap["kind"], &kind); err != nil {
		return nil, err
	}

	var message interface{}
	if kind == ProposeEntryKind {
		var m ProposeAck
		if err := json.Unmarshal(data, &m); err != nil {
			return nil, err
		}
		message = m
	} else if kind == JoinDocumentKind {
		var m JoinDocument
		if err := json.Unmarshal(data, &m); err != nil {
			return nil, err
		}
		message = m
	} else {
		return nil, errors.New("received invalid message kind: " + kind)
	}

	return message, nil
}
