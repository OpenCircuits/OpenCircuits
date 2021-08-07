package doc

// MessageWrapper is used to send messages to the Document thread.
//	Resp should be buffered to avoid blocking the Document thread
type MessageWrapper struct {
	SessionID string
	Resp      chan<- interface{}
	Data      interface{}
}

//
// Messages sent to the Document
//

type Propose = ProposedEntry

type JoinDocument struct {
	LogClock uint64
}

type LeaveDocument struct{}

//
// Messages sent to the Session
//

type ProposeAck struct {
	AcceptedClock uint64
}

type ProposeNack struct {
	LogClock uint64
	ErrorMsg string
}

type WelcomeMessage struct {
	MissedEntries []AcceptedEntry
}

type NewEntry = AcceptedEntry

//
// Helper functions used by the Document to avoid accidently sending types over
//	the channel that aren't expected
//

func SafeSendAck(ch chan<- interface{}, m ProposeAck) {
	ch <- m
}

func SafeSendNack(ch chan<- interface{}, m ProposeNack) {
	ch <- m
}

func SafeSendWelcome(ch chan<- interface{}, m WelcomeMessage) {
	ch <- m
}

func SafeSendNewEntry(ch chan<- interface{}, m NewEntry) {
	ch <- m
}
