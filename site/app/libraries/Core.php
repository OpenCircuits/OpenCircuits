<?php

namespace app\libraries;

use app\libraries\database\SQLiteDatabase;
use app\models\Config;

/**
 * Class core
 *
 * Core of the application that acts as a middle man to other libraries.
 */
class Core {

	/** @var AbstractDatabase */
	private $db = null;
	
	/** @var User */
	private $user = null;
	
	/** @var string */
	private $output;
	
	/** @var Config */
	private $config;

	/**
	 * Core constructor
	 */
	public function __construct() {
		$this->config = new Config();
		$this->output = "";
	}
	
	/**
	 * Loads and connects to the database
	 */
	public function loadDatabase() {
		$this->db = new SQLiteDatabase(['db_path' => 'data/opencircuits.db']);
		$this->db->connect();
	}
	
	public function renderOutput($output) {
		$this->output .= $output;
	}
	
	/**
	 * Echos the stored output buffer that we've been building
	 */
	public function displayOutput() {
		echo($this->getOutput());
	}

	public function getDB() {
		return $this->db;
	}
	
	public function getUser() {
		return $this->user;
	}
	
	public function getOutput() {
		return $this->output;
	}
	
	public function getConfig() {
		return $this->config;
	}

}