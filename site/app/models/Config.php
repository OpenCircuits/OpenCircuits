<?php

namespace app\models;

/**
 * Class Config
 *
 */
class Config {
    
    /** @property @var boolean If the app is in debug mode */
    protected $debugMode;
    
    /**
     * Config constructor
     * 
     * @param Core  $core
     * @param array $details
     */
    public function __construct() {
        $properties = array();
        
        $file = fopen('../data/config.txt', 'r');
        
        if (!$file) {
            die("Could not find config file!");
        }
        
        // Read properties line by line
        while (!feof($file)) {
            $line = fgets($file);
            
            $pos = strpos($line,'=');
                        
            $prop = substr($line, 0, $pos);
            $value = substr($line, $pos+1);
            
            $properties[$prop] = $value;
        }
        
        fclose($file);
        
        $this->debugMode = ($properties['DebugMode'] === "true");
    }
    
    public function isDebugMode() {
        return $debugMode;
    }
    
}