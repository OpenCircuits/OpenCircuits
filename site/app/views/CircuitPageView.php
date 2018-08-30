<?php

namespace app\views;

class CircuitPageView {
    
    public function getOutput($user, $config) {
        $return = <<<HTML
<!DOCTYPE HTML>
<html>
    <head>
        <meta charset="utf-8"/>
        <meta name="description" content="Open Circuits">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" />

        <link rel="stylesheet" href="css/stylesheet.css">
        <link rel="apple-touch-icon" sizes="180x180" href="img/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png">
        <link rel="manifest" href="img/manifest.json">
        <link rel="mask-icon" href="img/safari-pinned-tab.svg" color="#5bbad5">
        <meta name="theme-color" content="#ffffff">
        <title>Open Circuits</title>
    </head>

    <body onload="start();">
        <div id="overlay" class="overlay" onclick="SideNavController.toggle();"></div>

        <nav>
            <div id="sidenav" class="sidenav">
                <div class="sidenav__accountinfo">
                    User
                </div>
                <div class="sidenav__content">
                    <h4 unselectable>My Graphs</h4>
                    <h4 unselectable>Examples</h4>
                    <ul id="sidenav-content-example-list">

                    </ul>
                </div>
            </div>
        </nav>

        <div id="content" class="content">
            <header id="header">
                <div class="header__left">
                    <span id="open-sive-nav-button" role="button" tabindex="0" class="header__left__sidenavbutton" onclick="SideNavController.toggle();">&#9776;</span>
                    <input id="project-name" class="header__left__projectname" type="text" value="Untitled Circuit*" alt="Name of project">
                </div>
                <div class="header__center">
                    <img id="logo" class="header__center__logo" src="img/icons/logo.svg" height="100%" alt="OpenCircuits logo" />
                </div>
                <div class="header__right">
                    <button type="button" onclick="document.getElementById('file-input').click();">
                        <img src="img/icons/open.svg" height="100%" alt="Open a file" />
                    </button>
                    <input id="file-input" type="file" name="name" style="display: none;" onchange="Importer.openFile();" multiple="false" required="true" accept=".circuit,.xml" />
                    <button type="button" onclick="Exporter.saveFile();">
                        <img src="img/icons/download.svg" height="100%" alt="Download current scene" />
                    </button>
                </div>
            </header>

            <main>
                <nav id="items" class="itemnav">
HTML;
                    $itemTypes = $config->getItems();
                    
                    // Output all items in the ItemNav menu
                    foreach($itemTypes as $itemType) {
                        $items = explode("&", $itemType);
                        $type = preg_replace("/([A-Z][a-z])/", " $1", $items[0]);
                        $dir = strtolower($items[0]);
                        $items = array_slice($items, 1);
                        
                        $return .= <<<HTML
                    <h4 unselectable>{$type}</h4>
HTML;
                        foreach ($items as $item) {
                            $ioobjectName = $item;
                            $imageName = strtolower($item);
                            $displayName = preg_replace("/([A-Z][a-z])/", " $1", $item);
                            $return .= <<<HTML
                        <button type="button" onclick="PlaceItemController.place(new {$ioobjectName});">
                            <img src="img/icons/{$dir}/{$imageName}.svg" ondragend="PlaceItemController.onDragEnd(event);" alt="{$displayName}" />
                            <br/>{$displayName}
                        </button>
HTML;
                        }
                    }
                    
                    $return .= <<<HTML
                </nav>
                <div id="open-items-tab" class="tab" onclick="ItemNavController.toggle();"> &#9776; </div>

                <canvas id="canvas" class="canvas"></canvas>

                <canvas id="designer-canvas" class="icdesigner" style="visibility: hidden;"></canvas>

                <div class="icbuttons">
                    <button id="ic-confirmbutton" class="icbuttons__button" onclick="icdesigner.confirm();" alt="Submit IC" style="visibility: hidden;">Confirm</button>
                    <button id="ic-cancelbutton"  class="icbuttons__button" onclick="icdesigner.cancel();"  alt="Cancel IC" style="visibility: hidden;">Cancel</button>
                </div>

                <div id="popup" class="popup" tabindex="-1" style="visibility: hidden;">
                    <input id="popup-name" type="text" value="Name :" alt="Name of object(s)">
                    <hr/>
                    <div id="popup-pos-text">Position</div>
                    <label id="popup-position-label" class="popup__label" unselectable disabled>
                        <input id="popup-position-x" type="number" value="0" min="-10000" max="10000" step="0.5" alt="X-Position of object(s)" />
                        <input id="popup-position-y" type="number" value="0" min="-10000" max="10000" step="0.5" alt="Y-Position of object(s)" />
                    </label>
                    <div id="popup-input-count-text">Input Count</div>
                    <label id="popup-input-count-label" class="popup__label" unselectable disabled>
                        <input id="popup-input-count" type="number" value="2" min="2" max="8" step="1" alt="Number of inputs object(s) have" />
                    </label>
                    <div id="popup-color-text">Color</div>
                    <label id="popup-color-label" class="popup__label" unselectable disabled>
                        <input id="popup-color-picker" type="color" value="#ffffff" alt="Color of object(s)" />
                    </label>
                    <button id="popup-ic-button" type="button" alt="Create">Create IC</button>
                    <button id="popup-bus-button" type="button" alt="Create a bus between selected ports">Bus</button>
                </div>

                <div id="context-menu" class="contextmenu" tabindex="-1" style="visibility: hidden;">
                    <button id="context-menu-cut" alt="Cut">Cut</button>
                    <button id="context-menu-copy" alt="Copy">Copy</button>
                    <button id="context-menu-paste" alt="Paste">Paste</button>
                    <button id="context-menu-select-all" alt="Select All">Select All</button>
                    <hr/>
                    <button id="context-menu-undo" alt="Undo">Undo</button>
                    <button id="context-menu-redo" alt="Redo">Redo</button>
                </div>

            </main>
        </div>
HTML;
        
        foreach ($config->getScripts() as $script) {
            $return .= <<<HTML
            <script src="{$script}"></script>
HTML;
        }

        $return .= <<<HTML
    </body>
</html>
HTML;
        return $return;
    }
    
}