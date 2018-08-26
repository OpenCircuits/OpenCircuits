<?php

/** Autoloading function */
spl_autoload_register(function ($class_name) {
    include '../' . str_replace("\\", "/", $class_name) . '.php';
});

use app\libraries\Core;
use app\controllers\CircuitPageController;


$core = new Core();
$core->loadDatabase();


$control = new CircuitPageController($core);
$control->run();


$core->displayOutput();