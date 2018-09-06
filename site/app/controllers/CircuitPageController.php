<?php

namespace app\controllers;

use app\libraries\Core;
use app\views\CircuitPageView;

class CircuitPageController {
    
    /** @var Core */
    protected $core;
    
    /** @var CircuitPageView */
    protected $view;
    
    public function __construct(Core $core) {
        $this->core = $core;
        $this->view = new CircuitPageView();
    }

    public function run() {
        $user = $this->core->getUser();
        $config = $this->core->getConfig();
        $itemNavConfig = $this->core->getItemNavConfig();
        
        $this->core->renderOutput($this->view->getOutput($user, $config, $itemNavConfig));
    }
    
}