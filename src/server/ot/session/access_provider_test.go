package session

import (
	"errors"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

func TestPermHelper(t *testing.T) {
	a := model.BasePermission{
		AccessLevel: model.AccessEdit,
	}

	if permHelper(&a, nil).AccessLevel != a.AccessLevel {
		t.Error("Failed in success case")
	}
	if permHelper(nil, errors.New("")).AccessLevel != model.AccessNone {
		t.Error("Failed in error case")
	}
	if permHelper(nil, nil).AccessLevel != model.AccessNone {
		t.Error("Failed in not found case")
	}
	if permHelper(&a, errors.New("")).AccessLevel != model.AccessNone {
		t.Error("Failed in error case w/ provided perms")
	}
}
