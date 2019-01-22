<?php

namespace app\models;

use app\libraries\Core;

/**
 * Class User
 * 
 * @method string getEmail()
 * 
 */
class User {
    
    /** @property @var string The email of the user */
    protected $email;
    
    /** @property @var string The hashed password of the user. */
    protected $password = null;
    
    /**
     * User constructor
     * 
     * @param Core  $core
     * @param array $details
     */
    public function __construct(Core $core, $details=array()) {
        if (count($details) == 0)
            return;
            
        $this->email = $details['UserEmail'];
            
        if (isset($details['UserPassword'])) {
            $this->setPassword($details['UserPassword']);
        }
    }
    
    /**
     * Sets and hashes the password of the user
     * 
     * @param string $password The raw password of the user
     */
    public function setPassword($password) {
        if (!empty($password)) {
            $info = password_get_info($password);
            if ($info['algo'] === 0) {
                $this->password = password_hash($password, PASSWORD_DEFAULT);
            } else {
                $this->password = $password;
            }
        }
    }
    
}