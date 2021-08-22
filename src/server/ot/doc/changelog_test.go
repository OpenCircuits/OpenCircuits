package doc

import (
	"errors"
	"fmt"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

func prop(clk uint64) model.ChangelogEntry {
	return model.ChangelogEntry{[]byte{}, clk, 0, "SCHEMA", "USER", model.NewSessionID()}
}

func TestChangelogAddMultiple(t *testing.T) {
	l := Changelog{}
	type Want struct {
		id  uint64
		err error
	}
	tests := []struct {
		p    model.ChangelogEntry
		want Want
	}{
		{prop(0), Want{0, nil}},
		{prop(1), Want{1, nil}},
		{prop(3), Want{0, errors.New("")}},
		{prop(0), Want{2, nil}},
	}

	for _, tt := range tests {
		testname := fmt.Sprintf("%d", tt.p.ProposedClock)
		t.Run(testname, func(t *testing.T) {
			ans, err := l.Accept(tt.p)
			if (err != nil) != (tt.want.err != nil) {
				t.Errorf("got %d, want %d", err, tt.want.err)
			} else if ans.AcceptedClock != tt.want.id {
				t.Errorf("got %d, want %d", ans.AcceptedClock, tt.want.id)
			}
		})
	}
}
