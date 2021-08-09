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
	ProposeAckKind     = "propose_ack"
	WelcomeMessageKind = "welcome_entry"
	NewEntriesKind     = "new_entries"
	CloseMessageKind   = "close"
)

func Serialize(s interface{}) ([]byte, error) {
	var kind string
	if _, ok := s.(ProposeAck); ok {
		kind = ProposeAckKind
	} else if _, ok := s.(WelcomeMessage); ok {
		kind = WelcomeMessageKind
	} else if _, ok := s.(NewEntries); ok {
		kind = NewEntriesKind
	} else if _, ok := s.(CloseMessage); ok {
		kind = CloseMessageKind
	} else {
		return nil, errors.New("serialized invalid type (INTERNAL PROTOCOL VIOLATION)")
	}

	m := structs.Map(s)
	m["kind"] = kind
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
	var err error
	if kind == ProposeEntryKind {
		var m ProposeEntry
		err = json.Unmarshal(data, &m)
		message = m
	} else if kind == JoinDocumentKind {
		var m JoinDocument
		err = json.Unmarshal(data, &m)
		message = m
	} else {
		err = errors.New("received invalid message kind: " + kind)
	}

	return message, err
}
