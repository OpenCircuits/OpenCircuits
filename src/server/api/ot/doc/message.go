package doc

type MessageWrapper struct {
	SessionID string
	Resp      chan<- interface{}
	Data      interface{}
}

//
// Messages for managing document changes
//

type Propose = ProposedEntry

type ProposeAck struct {
	AcceptedClock uint64
}

type ProposeNack struct {
	LogClock uint64
	ErrorMsg string
}

//
// Messages for managing connected sessions
//

type JoinDocument struct {
	LogClock uint64
}

type WelcomeMessage struct {
	MissedEntries []AcceptedEntry
}
type LeaveDocument struct{}
