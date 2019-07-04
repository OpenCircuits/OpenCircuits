package db

var db AbstractDatabase

func Initialize(database AbstractDatabase) {
	db = database
}

func GetDatabase() AbstractDatabase {
	return db
}