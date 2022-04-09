package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
)

func TestCircuitLifecycle(t *testing.T) {
	launchServer(t)

	c := model.Circuit{
		Metadata: model.CircuitMetadata{
			Name:      "ABC",
			Desc:      "DEF",
			Thumbnail: "No",
			Version:   "1.1",
		},
		Content: "Content",
	}
	var cID model.CircuitID
	runRequests(t, []testRequest{
		{ // Create the circuit
			route:        "/api/circuits/0",
			verb:         "PUT",
			headers:      AUTH_HEADERS,
			body:         &c,
			expectedCode: http.StatusAccepted,
			checkResp: func(resp string) error {
				var r api.UpsertCircuitResponse
				err := json.Unmarshal([]byte(resp), &r)
				cID = r.CircuitID
				return err
			},
		},
	})

	var lID model.LinkID
	runRequests(t, []testRequest{
		{ // Add read link
			route:   "/api/circuits/" + cID.String() + "/link",
			verb:    "PUT",
			headers: AUTH_HEADERS,
			body: &api.UpsertLinkRequest{
				LinkPerm: model.AccessView,
				Regen:    false,
			},
			expectedCode: http.StatusAccepted,
			checkResp: func(s string) error {
				var r model.CircuitPermissions
				err := json.Unmarshal([]byte(s), &r)
				if err != nil {
					return err
				}
				if r.LinkPerm != model.AccessView {
					return errors.New("received incorrect access response")
				}
				lID = r.LinkID
				return nil
			},
		},
	})

	checkGetC := func(s string) error {
		var c2 model.Circuit
		if err := json.Unmarshal([]byte(s), &c2); err != nil {
			return err
		}
		if c2 != c {
			return errors.New("Circuit content did not match")
		}
		return nil
	}
	runRequests(t, []testRequest{
		{ // Get the circuit (as the wrong user)
			route:        "/api/circuits/" + cID.String(),
			verb:         "GET",
			headers:      AUTH_HEADERS2,
			expectedCode: http.StatusForbidden,
		},
		{ // Get the circuit
			route:        "/api/circuits/" + cID.String(),
			verb:         "GET",
			headers:      AUTH_HEADERS,
			expectedCode: http.StatusOK,
			checkResp:    checkGetC,
		},
		{ // Get the wrong ID
			route:        "/api/circuits/1000",
			verb:         "GET",
			headers:      AUTH_HEADERS,
			expectedCode: http.StatusNotFound,
		},
		{ // Get the circuit as the wrong user (with the LinkID)
			route:        "/api/circuits/" + cID.String() + "?l=" + string(lID),
			verb:         "GET",
			headers:      AUTH_HEADERS2,
			expectedCode: http.StatusOK,
			checkResp:    checkGetC,
		},
		{ // Get the circuit anonymously (with the LinkID)
			route:        "/api/circuits/" + cID.String() + "?l=" + string(lID),
			verb:         "GET",
			expectedCode: http.StatusOK,
			checkResp:    checkGetC,
		},
	})

	c.Content = "Modified Content"
	runRequests(t, []testRequest{
		{ // Update the circuit (as the wrong user)
			route:        "/api/circuits/" + cID.String(),
			verb:         "PUT",
			headers:      AUTH_HEADERS2,
			body:         &c,
			expectedCode: http.StatusForbidden,
		},
		{ // Update the circuit
			route:        "/api/circuits/" + cID.String(),
			verb:         "PUT",
			headers:      AUTH_HEADERS,
			body:         &c,
			expectedCode: http.StatusAccepted,
		},
		{ // Delete the circuit (as the wrong user)
			route:        "/api/circuits/" + cID.String() + "/delete",
			verb:         "POST",
			headers:      AUTH_HEADERS2,
			expectedCode: http.StatusForbidden,
		},
		{ // Regenerate link and add edit perms
			route:   "/api/circuits/" + cID.String() + "/link",
			verb:    "PUT",
			headers: AUTH_HEADERS,
			body: &api.UpsertLinkRequest{
				LinkPerm: model.AccessEdit,
				Regen:    true,
			},
			expectedCode: http.StatusAccepted,
			checkResp: func(s string) error {
				var r model.CircuitPermissions
				err := json.Unmarshal([]byte(s), &r)
				if err != nil {
					return err
				}
				if r.LinkPerm != model.AccessEdit {
					return errors.New("received incorrect access response")
				}
				if lID == r.LinkID {
					return errors.New("link ID did not regenerate")
				}
				lID = r.LinkID
				return nil
			},
		},
	})

	runRequests(t, []testRequest{
		{ // Update the circuit (as the wrong user)
			route:        "/api/circuits/" + cID.String() + "?l=" + string(lID),
			verb:         "PUT",
			headers:      AUTH_HEADERS2,
			body:         &c,
			expectedCode: http.StatusAccepted,
		},
		{ // Delete the circuit (as the wrong user)
			route:        "/api/circuits/" + cID.String() + "/delete" + "?l=" + string(lID),
			verb:         "POST",
			headers:      AUTH_HEADERS2,
			expectedCode: http.StatusForbidden,
		},
		{ // Remove link
			route:   "/api/circuits/" + cID.String() + "/link",
			verb:    "PUT",
			headers: AUTH_HEADERS,
			body: &api.UpsertLinkRequest{
				LinkPerm: model.AccessNone,
				Regen:    false,
			},
			expectedCode: http.StatusAccepted,
			checkResp: func(s string) error {
				var r model.CircuitPermissions
				err := json.Unmarshal([]byte(s), &r)
				if err != nil {
					return err
				}
				if r.LinkPerm != model.AccessNone {
					return errors.New("received incorrect access response")
				}
				return nil
			},
		},
		{ // Get the circuit (expired link)
			route:        "/api/circuits/" + cID.String() + "?l=" + string(lID),
			verb:         "GET",
			headers:      AUTH_HEADERS2,
			expectedCode: http.StatusForbidden,
		},
		{ // Update the circuit (expired link)
			route:        "/api/circuits/" + cID.String() + "?l=" + string(lID),
			verb:         "PUT",
			headers:      AUTH_HEADERS2,
			body:         &c,
			expectedCode: http.StatusForbidden,
		},
		{ // Delete the circuit (expired link)
			route:        "/api/circuits/" + cID.String() + "/delete" + "?l=" + string(lID),
			verb:         "POST",
			headers:      AUTH_HEADERS2,
			expectedCode: http.StatusForbidden,
		},
		{ // Delete the circuit
			route:        "/api/circuits/" + cID.String() + "/delete",
			verb:         "POST",
			headers:      AUTH_HEADERS,
			expectedCode: http.StatusAccepted,
		},
		{ // Get the circuit (doesn't exist)
			route:        "/api/circuits/" + cID.String(),
			verb:         "GET",
			headers:      AUTH_HEADERS,
			expectedCode: http.StatusNotFound,
		},
	})
}
