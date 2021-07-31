package doc

type MessageWrapper struct {
	Resp chan<- interface{}
	Data interface{}
}

//
// Messages for managing document changes
//

type ProposeAction struct {
	Action        []byte
	ProposedClock uint64
	SessionID     string
	UserId        string
}
type ProposeAck struct {
	AcceptedClock uint64
}
type ProposeNack struct {
	LogClock uint64
}

//
// Messages for managing connected sessions
//

type JoinDocument struct {
	LogClock uint64
}
type WelcomeMessage struct {
	MissedEntries []LogEntry
}
type LeaveDocument struct{}
