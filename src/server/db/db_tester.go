package db

import (
	"math/rand"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

func toListing(id model.CircuitID, md model.CircuitMetadata) model.CircuitListing {
	return model.CircuitListing{
		ID:        id,
		Name:      md.Name,
		Desc:      md.Desc,
		Version:   md.Version,
		Thumbnail: md.Thumbnail,
	}
}

func TestCircuitDB(t *testing.T, driver model.CircuitDB) {
	IntegrationTests(t, driver)
	LimitsTests(t, driver)
}

func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

func LimitsTests(t *testing.T, driver model.CircuitDB) {
	randCircuit := func() model.Circuit {
		return model.Circuit{
			Metadata: model.CircuitMetadata{
				Name:      RandomString(model.NameSizeLimit),
				Desc:      RandomString(model.DescSizeLimit),
				Thumbnail: RandomString(model.ThumbnailSizeLimit),
				Version:   model.SchemaVersion(RandomString(model.VersionSizeLimit)),
			},
			Content: RandomString(model.ContentSizeLimit),
		}
	}
	checkCircuit := func(id model.CircuitID, c model.Circuit) {
		loadedCircuit, found := driver.LoadCircuit(id)
		if !found {
			t.Fatal("Failed to load circuit")
		}
		if loadedCircuit != c {
			t.Fatal("Circuit was corrupted")
		}
	}
	c1 := randCircuit()

	cid := driver.InsertCircuit(c1, model.NewCircuitPermissions("LimitsTest1"))
	checkCircuit(cid, c1)

	c2 := randCircuit()
	driver.UpdateCircuit(cid, c2)
	checkCircuit(cid, c2)

	driver.DeleteCircuit(cid)
}

func IntegrationTests(t *testing.T, driver model.CircuitDB) {
	c1 := model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      "C1",
			Desc:      "Desc1",
			Thumbnail: "Thumb1",
			Version:   "v1",
		},
		Content: "Content1",
	}
	c1_modified := model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      "C1_modified",
			Desc:      "Desc1_modified",
			Thumbnail: "Thumb1_modified",
			Version:   "v1_modified",
		},
		Content: "Content1_modified",
	}
	p1 := model.CircuitPermissions{
		Owner:    "U1",
		LinkID:   "C1_Sharing",
		LinkPerm: model.AccessEdit,
	}
	p1_modified := model.CircuitPermissions{
		Owner:    "U1_modified",
		LinkID:   "C1_Sharing_modified",
		LinkPerm: model.AccessView,
	}
	c2 := model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      "C2",
			Desc:      "Desc2",
			Thumbnail: "Thumb2",
			Version:   "v2",
		},
		Content: "Content2",
	}
	c2_modified := model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      "C2_modified",
			Desc:      "Desc2_modified",
			Thumbnail: "Thumb2_modified",
			Version:   "v2_modified",
		},
		Content: "Content2_modified",
	}
	p2 := model.CircuitPermissions{
		Owner:    "U2",
		LinkID:   "C2_Sharing",
		LinkPerm: model.AccessEdit,
	}
	p2_modified := model.CircuitPermissions{
		Owner:    "U2_modified",
		LinkID:   "C2_Sharing_modified",
		LinkPerm: model.AccessView,
	}

	checkPermissions := func(id model.CircuitID, p model.CircuitPermissions, tag string) {
		loadedPerms, ok := driver.LoadPermissions(id)
		if !ok {
			t.Errorf("Failed to load permissions %s", tag)
		}
		if loadedPerms != p {
			t.Errorf("Circuit %s insert/load lost permission data", tag)
		}
	}
	checkCircuit := func(id model.CircuitID, c model.Circuit, tag string) {
		loadedCircuit, ok := driver.LoadCircuit(id)
		if !ok {
			t.Errorf("Failed to load circuit %s", tag)
		}
		if loadedCircuit != c {
			t.Errorf("Circuit %s insert/load lost data", tag)
		}
	}
	checkEnumerate := func(u model.UserID, expected []model.CircuitListing, tag string) {
		listing := driver.EnumerateUser(u)
		listingMap := make(map[model.CircuitID]model.CircuitListing)
		for _, l := range listing {
			listingMap[l.ID] = l
		}
		for _, e := range expected {
			l, ok := listingMap[e.ID]
			if !ok {
				t.Errorf("EnumerateUser missed result (%d) %s", e.ID, tag)
			} else {
				if l != e {
					t.Errorf("EnumerateUser result incorrect (%d) %s", e.ID, tag)
				}
				delete(listingMap, e.ID)
			}
		}

		for k := range listingMap {
			t.Errorf("EnumerateUser erroneous result (%d) %s", k, tag)
		}
	}

	// InsertCircuit
	c1ID := driver.InsertCircuit(c1, p1)
	checkCircuit(c1ID, c1, "c1 insert")
	checkPermissions(c1ID, p1, "c1 insert")

	c2ID := driver.InsertCircuit(c2, p2)
	checkCircuit(c2ID, c2, "c2 insert")
	checkPermissions(c2ID, p2, "c2 insert")

	// UpdateCircuit
	driver.UpdateCircuit(c1ID, c1_modified)
	checkCircuit(c1ID, c1_modified, "c1 update")
	checkPermissions(c1ID, p1, "c1 update")

	driver.UpdateCircuit(c2ID, c2_modified)
	checkCircuit(c2ID, c2_modified, "c2 update")
	checkPermissions(c2ID, p2, "c2 update")

	// UpdatePermissions
	driver.UpdatePermissions(c1ID, p1_modified)
	checkCircuit(c1ID, c1_modified, "c1 perm update")
	checkPermissions(c1ID, p1_modified, "c1 perm update")

	driver.UpdatePermissions(c2ID, p2_modified)
	checkCircuit(c2ID, c2_modified, "c2 perm update")
	checkPermissions(c2ID, p2_modified, "c2 perm update")

	// EnumerateUser
	checkEnumerate("U1_modified", []model.CircuitListing{toListing(c1ID, c1_modified.Metadata)}, "U1")
	checkEnumerate("U2_modified", []model.CircuitListing{toListing(c2ID, c2_modified.Metadata)}, "U2")

	// Transfer ownership
	p1_modified.Owner = p2_modified.Owner
	driver.UpdatePermissions(c1ID, p1_modified)
	checkEnumerate("U1_modified", []model.CircuitListing{}, "Change Owner (U1)")
	checkEnumerate("U2_modified", []model.CircuitListing{
		toListing(c1ID, c1_modified.Metadata),
		toListing(c2ID, c2_modified.Metadata),
	}, "Change Owner (U2)")

	driver.DeleteCircuit(c1ID)
	if _, ok := driver.LoadCircuit(c1ID); ok {
		t.Error("Failed to delete circuit c1")
	}

	loadedCircuit, ok := driver.LoadCircuit(c2ID)
	if !ok {
		t.Error("Deleting c1 circuit deleted c2 circuit as well")
	}
	if loadedCircuit != c2_modified {
		t.Error("Deleting c1 corrupted c2")
	}

	driver.DeleteCircuit(c2ID)
	if _, ok = driver.LoadCircuit(c2ID); ok {
		t.Error("Failed to delete circuit c2")
	}
}
