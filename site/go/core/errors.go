package core

import (
	"log"
	"os"
)

// CheckError :
//  Post condition: If err is not nil, err will be logged and the program exited
//                  Otherwise, nothing
func CheckError(err error) {
	CheckErrorMessage(err, "")
}

// CheckErrorMessage :
//  Post condition: If err is not nil, err will be logged along with the
//                    supplied message and the program exited
//                  Otherwise, nothing
func CheckErrorMessage(err error, msg string) {
	if err != nil {
		log.Printf("%s %v\n", msg, err)
		os.Exit(1)
	}
}
