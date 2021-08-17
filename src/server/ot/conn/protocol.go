package conn

import (
	"encoding/json"
	"errors"
	"fmt"

	"github.com/OpenCircuits/OpenCircuits/site/go/ot/doc"
)

//
// Types in this file are mirrored in ot/Protocol.ts
//

type RawMessageWrapper struct {
	Type string
	Msg  json.RawMessage
}

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

func Serialize(s interface{}) ([]byte, error) {
	var t string
	switch s.(type) {
	case ProposeAck:
		t = "ProposeAck"
	case WelcomeMessage:
		t = "WelcomeMessage"
	case NewEntries:
		t = "NewEntries"
	case CloseMessage:
		t = "CloseMessage"
	default:
		return nil, errors.New("serialized invalid type (INTERNAL PROTOCOL VIOLATION)")
	}

	rawMsg, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return json.Marshal(RawMessageWrapper{t, rawMsg})
}

//
// Messages sent FROM the client
//

type (
	ProposeEntry = doc.ProposedEntry
	// TODO: JoinDocument needs to have auth information
	JoinDocument = doc.JoinDocument
)

func Deserialize(data []byte) (interface{}, error) {
	var rawMsg RawMessageWrapper
	err := json.Unmarshal(data, &rawMsg)
	if err != nil {
		return nil, err
	}

	t := rawMsg.Type
	switch {
	case t == "ProposeEntry":
		var m ProposeEntry
		err := json.Unmarshal(rawMsg.Msg, &m)
		return m, err
	case t == "JoinDocument":
		var m JoinDocument
		err := json.Unmarshal(rawMsg.Msg, &m)
		return m, err
	default:
		return nil, errors.New(fmt.Sprint("received invalid message kind: ", rawMsg))
	}
}
