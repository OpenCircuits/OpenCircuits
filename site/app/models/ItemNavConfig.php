<?php

namespace app\models;

/**
 * Class ItemNavConfig
 *
 */
class ItemNavConfig {
    
    /** @property @var array */
    protected $sections;
    
    /**
     * ItemNavConfig constructor
     * 
     * @param Core  $core
     * @param array $details
     */
    public function __construct() {
        $this->sections = array();
        
        $file = fopen('../data/itemnavconfig.txt', 'r');
        
        if (!$file) {
            die("Could not find item nav config file!");
        }
        
        // Read properties line by line
        while (!feof($file)) {
            $line = fgets($file);
            
            // item type
            if ($line[0] == "[") {
                $title = substr($line, 1, strpos($line, "]")-1);
                $section = array();
                $section["name"]  = substr($title, 0, strpos($title, "="));
                $section["dir"]   = substr($title, strpos($title, "=")+1);
                $section["items"] = array();
                $this->sections[] = $section;
            } else if (!empty(trim($line))) {
                $props = explode("&", $line);
                $item = array();
                $item["display"] = trim($props[0]);
                $item["img"]     = trim($props[1]);
                $item["js"]      = trim($props[2]);
                if (count($props) > 3)
                    $item["not"] = trim($props[3]);
                $this->sections[count($this->sections)-1]["items"][] = $item;
            }
        }
        
        fclose($file);
    }
    
    public function getSections() {
        return $this->sections;
    }
    
}