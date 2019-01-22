<?php
 
namespace app\libraries\database;
 
class DatabaseQueries {
 
    /** @var Core */
    protected $core;
    
    /** @var AbstractDatabase */
    protected $db;
 
    public function __construct(Core $core) {
        $this->core = $core;
        $this->db = $core->getDB();
    }
    
    // public function 
}
