package db

import "github.com/OpenCircuits/OpenCircuits/site/go/model"

type AbstractDatabase interface {
	LoadCircuit(id int64) (*model.Circuit, error)
	EnumerateCircuits(userId string) ([]model.CircuitHandle, error)
	CreateCircuit(circuit *model.Circuit) error
	UpdateCircuit(circuit *model.Circuit) error
	Close()
}