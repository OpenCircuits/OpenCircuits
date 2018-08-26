<?php

namespace app\libraries

class Core {

	private $db = null;

	public function __construct() {
		$this->db = new \PDO("sqlite:" . 'opencircuits.db');

		if (!$this->db) {
			die('Could not connect: ' . mysql_error());
		}
	}

	public function getDB() {
		return $this->db;
	}

}