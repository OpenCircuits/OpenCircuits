package datastore

import (
	"context"
	"os"
	"sort"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/db"
	v0 "github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/v0"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/datastore/v0_1"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

// To run these tests:
// 1. Setup a new GCP project, adding "Firestore in Datastore mode"
// 1. Install `gcloud` CLI and configure for your project (DATASTORE_PROJECT_ID below)
// 1. Install the GCP datastore emulator
// 2. run `gcloud beta emulators datastore start --no-store-on-disk --use-firestore-in-datastore-mode`
// 4. Run tests as normal with `DATASTORE_PROJECT_ID` and `DATASTORE_EMULATOR_HOST` env vars
//		(i.e. `DATASTORE_PROJECT_ID=closedcircuits DATASTORE_EMULATOR_HOST=localhost:8081 go test./..`)
//	    (if using vscode, these can be set under the "go.testEnvVars")

func tryGetEnvVars(t *testing.T) (string, string) {
	host := os.Getenv("DATASTORE_EMULATOR_HOST")
	project := os.Getenv("DATASTORE_PROJECT_ID")
	if host == "" || project == "" {
		t.Skip("DATASTORE_EMULATOR_HOST/PROJECT_ID not set... skipping")
	}
	return host, project
}

func TestCircuit(t *testing.T) {
	h, p := tryGetEnvVars(t)
	driver, err := NewEmuCircuitDBFactory(context.Background(), p, h)
	if err != nil {
		t.Fatal("Failed to connect to GCP datastore emulator")
	}
	db.TestCircuitDB(t, driver.Create())
}

func TestMigration_v0_v0_1(t *testing.T) {
	h, p := tryGetEnvVars(t)
	driver, err := newEmuCircuitDBFactory(context.Background(), p, h)
	if err != nil {
		t.Fatal("Failed to connect to GCP datastore emulator")
	}
	d := driver.create()

	// Insert some circuits under the old version
	d.v0().UpsertCircuit(0x16, v0.DatastoreCircuit{
		Name:            "MyCircuit1",
		Owner:           "User1",
		Desc:            "ABC",
		Thumbnail:       "XYZ",
		Version:         "1.0",
		CircuitDesigner: "CONTENT",
	})
	d.v0().UpsertCircuit(0x17, v0.DatastoreCircuit{
		Name:            "MyCircuit2",
		Owner:           "User1",
		Desc:            "ABCD",
		Thumbnail:       "XYZW",
		Version:         "1.1",
		CircuitDesigner: "CONTENT1",
	})

	// test Enumerate circuits
	checkEnumerateUser := func(user model.UserID) {
		listings := d.EnumerateUser(user)
		sort.Slice(listings, func(i, j int) bool {
			return listings[i].Name < listings[j].Name
		})
		if len(listings) != 2 {
			t.Fatalf("Expected 2 listings, got %d", len(listings))
		}
		if (listings[0] != model.CircuitListing{
			ID:        0x16,
			Name:      "MyCircuit1",
			Desc:      "ABC",
			Version:   "1.0",
			Thumbnail: "XYZ",
		}) {
			t.Error("Circuit 1 listing did not match")
		}
		if (listings[1] != model.CircuitListing{
			ID:        0x17,
			Name:      "MyCircuit2",
			Desc:      "ABCD",
			Version:   "1.1",
			Thumbnail: "XYZW",
		}) {
			t.Error("Circuit 2 listing did not match")
		}
	}
	checkEnumerateUser("User1")

	// Perform the migration via LoadPermissions
	permissions, ok := d.LoadPermissions(0x16)
	if !ok {
		t.Fatal("Failed to load permissions of old circuit")
	}
	if (permissions != model.CircuitPermissions{
		Owner:    "User1",
		LinkID:   "",
		LinkPerm: model.AccessNone,
	}) {
		t.Fatal("Circuit 1 permissions did not match")
	}
	// Check the migration happened
	c, chunks, err := d.v0_1().LoadCircuit(0x16)
	if err != nil {
		t.Fatal("post-migration circuit failed to load")
	}
	if (c != v0_1.Circuit{
		Name:      "MyCircuit1",
		Desc:      "ABC",
		Version:   "1.0",
		Thumbnail: "XYZ",
	}) {
		t.Fatal("post-migration circuit MD didnt match")
	}
	if len(chunks) != 1 || chunks[0].Seq != 1 || chunks[0].Content != "CONTENT" {
		t.Fatal("post-migration circuit content didnt match")
	}

	// Check enumerate again to make sure post-migration circuit is OK and no dups.
	checkEnumerateUser("User1")

	d.DeleteCircuit(0x16)
	d.DeleteCircuit(0x17)

	listings := d.EnumerateUser("User1")
	if len(listings) > 0 {
		t.Fatal("Failed to delete pre/post migration circuits")
	}
}
