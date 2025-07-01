---
title: Go Crash Course
---

# Crash Course for Developing our Go Code

## Writing Go Code
This is kind of a WIP.  If you are reading this and have suggestions, we will be receptive.  If you are just starting with Go / OpenCircuits, please give us your feedback so we can make our getting-started material more helpful.

### Go syntax... briefly
The Go language is kind of like C mixed with python.  It is syntactically simple and does not support high level language features like list comprehensions, but it has more quality-of-life features than C does (i.e. garbage collection, lambdas).  This simplicity is the primary reason we chose Go over Rust and the strong typing is why we chose Go over Python or JavaScript.  TypeScript is still being considered as an alternative.

There is a canonical Go style, which can be enforced by running `go fmt .`.  This command can also do other things.  Please run this before committing; eventually we will make this a git hook.  Yes, I know Go uses tabs for indentation.  Yes, we're following these guidelines.

Here's the anatomy of some simple Go code:
```go
// Functions can return multiple values, but they are NOT tuples.  They must be unpacked by the caller.
// It is idiomatic for functions that fail to return an "error" type that is nil on success
func foo(param int, param1 *float64) (int, error) {
    // Variables can be declared explicitly
    var tmp int
    tmp = param

    // Or declaired inline and type "int" is inferred
    tmp1 := param

    // There are pointers, like in C, and they can be nil
    if param1 != nil {
        // Casts are function-style casts
        *param1 = float64(param)
    } else {
        // There are no exceptions, only errors, which can be
        //  cumbersome, but won't surprise you like exceptions
        return 0, errors.New("param1 was nil")
    }

    return tmp1+1, nil
}
```

You will find that go's error checking can get tedious and redundant and anyone who has used Haskell will be asking "where is \<$\>?"  The philosophy is that explicit error checking is easier to read and simpler to reason about than things like fmap or null propagation.  You will be writing `if err == nil { ...` a lot, but that's a good thing, because we want to be mindful of error cases.

### Writing self-contained / modular / decoupled Go code
Go has a variety of features to help us write better code.  This is not exhaustive and I am not an expert on Go, so use this as a starting point.  This is also a crash-course in "Principles of Software".

Go does not have the object-oriented features that C++ and Java has.  There are structs, but these are more like C structs and privacy is managed per-package.  Things declared in a package that start with an upper-case letter are exported from that package: `func Foo() {}`, `type Data struct {}`.  Things declared with a lower-case letter are not exported from the package, but available to sub-packages: `func privFoo() {}`, `type privData struct {}`.  If we combine this knowledge with another Go feature, interfaces, we can have private code / data types in packages that expose features defined outside the package.  Packages should obey the directory structure,

We'll use a simplified version of our authentication interface as an example:

Let's define our authentication interface as:
```go
type AuthenticationMethod interface {
	RegisterHandlers(*gin.Engine)
	ExtractIdentity(string) (string, error)
}
```

In a sub-package, we can define a trivial authentication method that requires no password (NoAuth, used for development).
```go
// This is out private data type; it has no data since it doesn't do anything,
//  but it serves as a type to satisfy the 'AuthenticationMethod' interface
type noLoginAuthenticationProvider struct {
}

// At this point, the Go compiler checks that '*noLoginAuthenticationProvider' satisfies the
//  'AuthenticationMethod' interface implicitly.  This is an idiomatic constructor for an object
func NewNoAuth() AuthenticationMethod {
    // We can create a pointer to an object with '&' and the Go garbage collector will
    //  make sure it will only get released when its no longer being used
    return &noLoginAuthenticationProvider{}
}

// This is the syntax for defining member functions on a struct.  You can only define member functions
//  in the package that defines the type.
func (nl noLoginAuthenticationProvider) RegisterHandlers(engine *gin.Engine) {
}

// You can also define member functions on a pointer to the struct.  This allows you to modify the
//  data in the struct in the function.  Without the pointer, the struct would be copied before calling.
func (nl *noLoginAuthenticationProvider) RegisterHandlers(engine *gin.Engine) {
}

func (nl noLoginAuthenticationProvider) ExtractIdentity(token string) (string, error) {
    if token == "" {
        return "", errors.New("user id cannot be blank in no_auth")
    }
    return "no_auth_" + token, nil
}
```

Notice that there is nothing that explicitly says that `*noLoginAuthenticationProvider` implements the `AuthenticationMethod` interface.  This is because interfaces are checked implicitly and there would be a compiler error if `*noLoginAuthenticationProvider` didn't satisfy the interface.  Since none of the interface functions need to modify our internal data structure, we could also say that `noLoginAuthenticationProvider` (without the pointer) satisfies the interface.  If struct `X` satisfies the interface `A`, then struct `*X` also satisfies `A`, but not vice versa.

### Functional Dependency Injection (AKA how we organize routes)
This might sound complicated, but its pretty simple in practice.  It means instead of creating a bunch of objects and interfaces for single-function abstractions, we use go's lambdas to help us write smaller code.

Here's an example from the API router.  We use it to inject authentication into routes:
```go
// This is a function that converts normal routes into authenticated routes.  The '_' is a name placeholder for when the name is not needed
func authenticatedHandler(manager auth.AuthenticationManager, handler func(_ *gin.Context, _ model.UserId)) func(c *gin.Context) {
        // We can return anonymous functions (lambdas) that can bind/refer to named variables in the enclosing scope
	return func(c *gin.Context) {
                // Use the injected/bound "manager" object to find out the authentication method
		am := manager.MatchToken(c.GetHeader("authType"))
		if am == nil {
                        // Go has anonymous structs, but the type inference isn't that great
			c.JSON(http.StatusBadRequest, struct {
				message string
			}{
				message: "Cannot call authenticated route without valid authentication header",
			})
			return
		}
                // Use the authentication methdo to extract an identity from the reported user's Id
		id, err := (*am).ExtractIdentity(c.GetHeader("authId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, nil)
			return
		}
                // After we retrieved the identity 'id', call the function to handle the request with the user's identity
		handler(c, id)
	}
}

// A trivial handler for testing authenticated routes
func pingHandler(c *gin.Context, userId model.UserId) {
	c.JSON(http.StatusOK, fmt.Sprintf("Thank you for pinging: %s", userId))
}

// Registers the route in 'gin'
func RegisterRoutes(router *gin.Engine, manager auth.AuthenticationManager) {
    // This is 'Function Dependency Injection'.
	router.GET("/api/ping", authenticatedHandler(manager, pingHandler))
}
```

Now i'll explain the name.  "Functional" means we use functions as first-class objects when executing the desired behavior.  "Dependency Injection" means there is some object that our handler needs (AuthenticationManager), but we construct the object separately and "inject" it in when needed.  While this object isn't an interface, this pattern is also used if the exact type of the object is not known at runtime.  Put together, it means we wrap each layer of behavior into a separate function that calls into the next layer with the results of the current layer and previous layers.

If you don't need to be writing your own wrapper functions, you don't have to fully understand this.  You just need to know which wrappers you need and existing routes can be helpful as a template.



## Contributing to the Go Code
You just read a crash course in developing Go code, using some of our code as examples.  It is important that this code is stable and secure since its handling user's private data.  While we do not handle passwords or personal information, the user's circuits are still private.  In general, do not expose more behavior than you need to from a package and don't assume any client-provided data is correct or valid.

You saw above how to add new routes to the API.  Adding new routes to the website is similiar.

If you've never dealt with pointers before, Go's pointers have training wheels.  Just remember to check that pointer types are non-null unless you can trivially prove that they will never be null.  If you accidentally use a null pointer, it will probably crash the server (which is bad).

The code is fairly simple, much simpler than the front-end code, but its designed to be modular and expandable so some design choices are not immediately obvious.

Now lets dive into the specific parts of the Go code, how they're organized, and why.

### AuthenticationManager
This object allows us to support multiple `AuthenticationMethod`s (i.e. Google, Facebook, GitHub) at the same time.  The `authenticationHandler` (above) resolves the user's id in-flight so it can be used generically in the routes.  Once a user has passed through this layer, we can assume that the `userId` is valid.

### CircuitStorageInterfaceFactory
This is a usage of the "Abstract Factory" pattern.  In general, this pattern allows us to use dependency injection (explained above) to vary the behavior of code at runtime, but is thread-safe since each object created by the factory can be distinct.  This is an important requirement of a web-server that is multi-threaded.  In this specific case, the factory allows us to use different backing stores for the circuit data without exposing how we interface with these backing stores to the code that processes the 'save' request.

You probably will not need to create a new one of these since the ones we support (in-memory, sqlite, and GCP) are sufficient, but its important to understand why its organized this way.

### The "Circuit" Model
There are two parts of the circuit on the backend.  There's some metadata, which is the data the backend needs access to, and there's the "Designer", which is the circuit's functional contents (gates, wires, etc.).  We avoid needing to decode the functional components in the Go code by factoring the metadata out into a separate structure.  All data that is needed by the backend code and is not tightly coupled to the structure of the circuit should be in the metadata.

