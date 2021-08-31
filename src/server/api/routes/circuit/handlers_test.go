package circuit

import (
	"net/http"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/drivers/mem"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/gin-gonic/gin"
)

func TestCreateCircuitSuccess(t *testing.T) {
	ctx := api.Context{
		NewCircuits: mem.NewCircuitDriver("TEST"),
		Access:      mem.NewAccess(),
		Context: &gin.Context{
			Keys: make(map[string]interface{}),
		},
	}
	uid := model.UserID("USER")
	ctx.Keys[api.Identity] = uid

	code, res := Create(&ctx)
	if code != http.StatusAccepted {
		t.Fatalf("expected result code %d, got %d", http.StatusAccepted, code)
	}
	r := res.(model.ImplicitMetadata)
	if r.Creator != "USER" {
		t.Fatal("received wrong creator")
	}

	p, ok := ctx.Access.GetCircuitUser(r.ID, uid)
	if !ok {
		t.Fatal("no permission for created circuit")
	}
	if p.AccessLevel != model.AccessCreator {
		t.Fatal("circuit created with non-creator permissions")
	}
}

func TestCreateCircuitAnon(t *testing.T) {
	ctx := api.Context{
		NewCircuits: mem.NewCircuitDriver("TEST"),
		Access:      mem.NewAccess(),
		Context: &gin.Context{
			Keys: make(map[string]interface{}),
		},
	}
	ctx.Keys[api.Identity] = model.UserID("ANON")

	code, _ := Create(&ctx)
	if code != http.StatusForbidden {
		t.Fatalf("expected result code %d, got %d", http.StatusForbidden, code)
	}
}
