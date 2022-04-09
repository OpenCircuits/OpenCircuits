package api

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/OpenCircuits/OpenCircuits/site/go/api"
	"github.com/OpenCircuits/OpenCircuits/site/go/auth"
	"github.com/OpenCircuits/OpenCircuits/site/go/db/mem"
	"github.com/OpenCircuits/OpenCircuits/site/go/launch"
)

const TEST_ADDR = "0.0.0.0:9999"

func launchServer(t *testing.T) {
	authManager := auth.AuthenticationManager{}
	authManager.RegisterAuthenticationMethod(auth.NewNoAuth())
	authManager.RegisterAuthenticationMethod(auth.NewAnonAuth())
	server := launch.PreLaunch(TEST_ADDR)

	// h, p := datastore.TryGetEnvVarsForTesting(t)
	// circuits, err := datastore.NewEmuCircuitDBFactory(context.Background(), p, h)
	// if err != nil {
	// 	t.Fatal("Failed to open connection to GCP datastore emulator (circuit)")
	// }

	circuits := mem.NewVolatileCircuitDB()

	api.RegisterRoutes(server.Router(), circuits, authManager)
	go server.Launch()
	time.Sleep(10 * time.Millisecond)
}

type testRequest struct {
	route   string
	verb    string
	headers map[string]string
	body    interface{}

	expectedCode int
	checkResp    func(string) error
}

func runRequests(t *testing.T, tests []testRequest) {
	client := &http.Client{}
	for _, test := range tests {
		// Create test body.  Strings are taken literally, but other objects are first converted to json
		var body io.Reader
		if test.body != nil {
			if s, ok := test.body.(string); ok {
				body = strings.NewReader(s)
			} else {
				var buf bytes.Buffer
				if err := json.NewEncoder(&buf).Encode(test.body); err != nil {
					t.Fatal("Failed to encode json for body object")
				}
				body = &buf
			}
		}

		req, err := http.NewRequest(test.verb, "http://"+TEST_ADDR+test.route, body)
		if err != nil {
			t.Fatal("Failed to create http request")
		}
		for k, v := range test.headers {
			req.Header.Set(k, v)
		}
		resp, err := client.Do(req)
		if err != nil {
			t.Fatal("Failed to send http request")
		}

		respContent := new(strings.Builder)
		_, err = io.Copy(respContent, resp.Body)

		if resp.StatusCode != test.expectedCode {
			t.Errorf("Unexpected response from %s: %s (%d) - %s", test.route, resp.Status, test.expectedCode, respContent)
		}

		if err != nil {
			t.Fatal("Failed to read response")
		}
		if test.checkResp != nil {
			if err = test.checkResp(respContent.String()); err != nil {
				t.Errorf("Request validation failed: %e", err)
			}
		}
	}
}

var AUTH_HEADERS = map[string]string{
	"authType": "no_auth",
	"authId":   "User1",
}

var AUTH_HEADERS2 = map[string]string{
	"authType": "no_auth",
	"authId":   "User2",
}

func TestPing(t *testing.T) {
	launchServer(t)

	runRequests(t, []testRequest{
		{ // Unauthenticated ping
			route:        "/api/ping",
			verb:         "GET",
			expectedCode: http.StatusForbidden,
		},
		{ // Authenticated ping
			route:        "/api/ping",
			verb:         "GET",
			headers:      AUTH_HEADERS,
			expectedCode: http.StatusOK,
		},
	})
}
