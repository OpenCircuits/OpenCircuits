package session

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/OpenCircuits/OpenCircuits/site/go/api/ot/doc"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/gorilla/websocket"
)

type sessionState struct {
	sessionID  string
	conn       *websocket.Conn
	done       chan<- string
	docUpdates chan interface{}
	doc        doc.Document
	docAck     chan interface{}
	// TODO Add cached permissions, which can be updated
	// perms   chan UserPermissions
}

type Session struct {
	SessionID string
}

func NewSession(doc doc.Document, conn *websocket.Conn, done chan<- string) Session {
	s := sessionState{
		sessionID:  utils.RandToken(128),
		conn:       conn,
		done:       done,
		docUpdates: make(chan interface{}),
		docAck:     make(chan interface{}),
		doc:        doc,
	}

	go s.networkListener()
	go s.documentListener()

	return Session{
		SessionID: s.sessionID,
	}
}

type sessMsg struct {
	Type string `json:"type"`
}

type sessResp struct {
	Result string `json:"result"`
	Data   interface{}
}

func parseMessage(data []byte) (interface{}, error) {
	var msg sessMsg
	err := json.Unmarshal(data, &msg)
	if err != nil {
		return nil, err
	}

	if msg.Type == "propose" {
		var propMsg doc.Propose
		err = json.Unmarshal(data, &propMsg)
		return propMsg, err
	} else if msg.Type == "join" {
		var joinDoc doc.JoinDocument
		err = json.Unmarshal(data, &joinDoc)
		return joinDoc, err
	}
	return nil, errors.New("unrecognized message type")
}

func (s sessionState) close() {
	s.done <- s.sessionID
	s.conn.Close()
	s.doc.SendUpdate <- doc.MessageWrapper{
		Resp: s.docUpdates,
		Data: doc.LeaveDocument{},
	}
	close(s.docUpdates)
}

func (s sessionState) handleMsg(data []byte) (interface{}, error) {
	msg, err := parseMessage(data)
	if err != nil {
		return nil, err
	}

	s.doc.SendUpdate <- doc.MessageWrapper{
		SessionID: s.sessionID,
		Resp:      s.docAck,
		Data:      msg,
	}
	return <-s.docAck, nil
}

// networkListener is the main loop of the session
func (s sessionState) networkListener() {
	defer s.close()

	// This can be synchronous because it is per-client
	for {
		mt, message, err := s.conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}

		var response []byte
		if resp, err := s.handleMsg(message); err == nil {
			response, _ = json.Marshal(sessResp{
				Result: "ok",
				Data:   resp,
			})
		} else {
			response, _ = json.Marshal(sessResp{
				Result: "error",
				Data:   err,
			})
		}

		err = s.conn.WriteMessage(mt, response)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func (s sessionState) documentListener() {
	for u := range s.docUpdates {
		go s.conn.WriteJSON(u)
	}
}
