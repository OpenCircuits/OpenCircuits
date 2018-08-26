<?php

namespace app\libraries\database;

use \PDO;
use \PDOException;

use app\exceptions\DatabaseException;

abstract class AbstractDatabase {

	/** @var PDO */
	protected $link = null;

	/** @var int */
	protected $query_count = 0;

	abstract public function getDSN();

    /**
     * Connects to a database through the PDO extension (@link http://php.net/manual/en/book.pdo.php).
     * We wrap the potential exception that would get thrown by the PDO constructor so that we can
     * bubble up the message, without exposing any of the parameters used by the connect function
     * as we don't want anyone to get the DB details.
     *
     * @throws DatabaseException
     */
	public function connect() {
		if ($this->link === null) {
			$this->query_count = 0;
			
			try {
				$this->link = new \PDO($this->getDSN());
			} catch (PDOException $e) {
				throw new DatabaseException($e->getMessage());
			}
		}
	}

	/**
     * "Disconnect" from current PDO connection by just setting the link to null, and PDO will take care of actually
     * recycling the connection upon the GC destruction of the PDO object. This will additionally commit any open
     * transactions before disconnecting.
     */
	public function disconnect() {
		$this->link = null;
	}
	
	/**
	 * @return boolean Returns true if we're connected to a database, else false
	 */
	public function isConnected() {
		return $this->link !== null;
	}
	
	/**
	 * Run a query against the connected PDO DB
	 * 
	 * @param  string $query 
	 * @param  array  $parameters
	 * 
	 * @return boolean true if query succeeded, else false
	 */
	public function query($query, $parameters=array()) {
		try {
			$this->query_count++;
			
			$statement = $this->link->prepare($query);
			$result = $statement->execute($parameters);
		} catch (PDOException $e) {
			throw new DatabaseException($e->getMessage(), $query, $parameters);
		}
		
		return $result;
	}

}