package conn

import "testing"

func TestDeserializeNormal(t *testing.T) {
	msg := []byte(`
	{
		"Type": "ProposeEntry",
		"Msg": {
			"Action": {
				"some_value": 1234
			},
			"ProposedClock": 1,
			"SchemaVersion": "3.0",
			"UserID": "TEST_USER"
		}
	}
	`)

	ret, err := Deserialize(msg)
	if err != nil {
		t.Error("failed to deserialize entry")
	}
	if _, ok := ret.(ProposeEntry); !ok {
		t.Error("received wrong type")
	}
}

func TestDeserializeBad(t *testing.T) {
	if _, err := Deserialize([]byte(`{ }`)); err == nil {
		t.Error("expected error")
	}
}
