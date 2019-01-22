<?php

namespace app\libraries\database;

class SQLiteDatabase extends AbstractDatabase {
    
    /** @var string */
    protected $db_path;
    
    public function __construct($connection_params=array()) {
        $this->path = $connection_params['db_path'];
    }
    
    public function getDSN() {
        return "sqlite:{$this->db_path}";
    }
    
}