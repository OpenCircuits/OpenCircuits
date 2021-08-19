package doc

import (
	"errors"
	"fmt"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

func prop(clk uint64) ProposeEntry {
	return ProposeEntry{[]byte{}, clk, "SCHEMA", "USER", model.NewSessionID()}
}

func TestChangelogAddMultiple(t *testing.T) {
	l := Changelog{}
	type Want struct {
		id  uint64
		err error
	}
	tests := []struct {
		p    ProposeEntry
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
			ans, err := l.AddEntry(tt.p)
			if (err != nil) != (tt.want.err != nil) {
				t.Errorf("got %d, want %d", err, tt.want.err)
			} else if ans.AcceptedClock != tt.want.id {
				t.Errorf("got %d, want %d", ans.AcceptedClock, tt.want.id)
			}
		})
	}
}

func smallChangelog() Changelog {
	l := Changelog{}
	l.AddEntry(prop(0))
	l.AddEntry(prop(1))
	l.AddEntry(prop(2))
	l.AddEntry(prop(3))

	return l
}

func TestChangelogSlice(t *testing.T) {
	l := smallChangelog()
	res := l.Slice(2)
	if len(res) != 2 {
		t.Errorf("got slice of length %d, want %d", len(res), 2)
	}
}

func TestChangelogRange(t *testing.T) {
	l := smallChangelog()
	res := l.Range(1, 3)
	if len(res) != 2 {
		t.Errorf("got slice of length %d, want %d", len(res), 2)
	} else if res[0].AcceptedClock != 1 {
		t.Errorf("slice started at %d, want %d", res[0].AcceptedClock, 1)
	}
}
