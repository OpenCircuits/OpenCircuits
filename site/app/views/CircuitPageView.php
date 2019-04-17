<?php

namespace app\views;

class CircuitPageView {

    public function getOutput($user, $config, $itemNavConfig) {
        $return = <<<HTML
<!DOCTYPE HTML>
<html>
    <head>
        <meta charset="utf-8"/>
        <meta name="description" content="Open Circuits">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0" />
        <meta name="theme-color" content="#999">

        <script src="https://unpkg.com/jspdf@latest/dist/jspdf.min.js"></script>

        <link rel="stylesheet" href="css/stylesheet.css">
        <link rel="apple-touch-icon" sizes="180x180" href="img/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="img/favicon-16x16.png">
        <link rel="manifest" href="img/manifest.json">
        <link rel="mask-icon" href="img/safari-pinned-tab.svg" color="#5bbad5">

        <title>Open Circuits</title>
    </head>
    <body>
        <div id="loading-screen" class="loading__screen">
            <div class="loading__screen__background"></div>
            <img class="loading__screen__logo" src="img/icons/logo.svg">
        </div>

        <div id="overlay" class="overlay invisible"></div>

        <div id="sidenav" class="sidenav shrink">
            <div class="sidenav__accountinfo">
                User
            </div>
            <div class="sidenav__content">
                <h4>
                    <label class="sidenav__content__switch">
                        <input id="sidenav-mode-checkbox" type="checkbox" checked />
                        <span class="sidenav__content__slider"></span>
                    </label>
                </h4>
                <h4 unselectable>My Circuits</h4>
                <h4 unselectable>Examples</h4>
                <ul id="sidenav-content-example-list">
                </ul>
            </div>
        </div>

        <div id="content" class="content">
            <header id="header">
                <div class="header__left">
                    <span id="header-sidenav-open-tab" role="button" tabindex="0" class="header__left__sidenavbutton">&#9776;</span>
                    <input id="header-project-name-input" class="header__left__projectname" type="text" value="Untitled Circuit*" alt="Name of project">
                </div>

                <div class="header__center">
                    <img id="logo" class="header__center__logo" src="img/icons/logo.svg" height="100%" alt="OpenCircuits logo" />
                </div>
                <div class="header__right">
                    <div>
                        <button type="button" onclick="document.getElementById('header-file-input').click();">
                            <img src="img/icons/open.svg" height="100%" alt="Open a file" />
                        </button>
                    </div>
                    <input id="header-file-input" type="file" name="name" style="display: none;" multiple="false" required="true" accept=".circuit,.xml" />

                    <div class="header__dropdown">
                        <button id="header-download-dropdown-button" class="header__dropdown__button">
                            <img src="img/icons/download.svg" height="100%" alt="Download current scene" />
                        </button>
                        <div id="header-download-dropdown-content" class="header__dropdown__content">
                            <div id="header-download-button" type="button">
                                <img src="img/icons/download.svg" height="100%" alt="Download current scene" />
                                <a>Download</a>
                            </div>
                            <div id="header-download-pdf-button" type="button">
                                <img src="img/icons/pdf_download.svg" height="100%" alt="Download current scene as PDF" />
                                <a>Download as PDF</a>
                            </div>
                            <div id="header-download-png-button" type="button">
                                <img src="img/icons/png_download.svg" height="100%" alt="Download current scene as PNG" />
                                <a>Download as PNG</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="context-menu" class="contextmenu" style="visibility: hidden;">
                    <button id="context-menu-cut" alt="Cut">Cut</button>
                    <button id="context-menu-copy" alt="Copy">Copy</button>
                    <button id="context-menu-paste" alt="Paste">Paste</button>
                    <button id="context-menu-select-all" alt="Select All">Select All</button>
                    <hr/>
                    <button id="context-menu-undo" alt="Undo">Undo</button>
                    <button id="context-menu-redo" alt="Redo">Redo</button>
                </div>

            </header>

            <main>
                <nav id="itemnav" class="itemnav shrink">
HTML;
                    $sections = $itemNavConfig->getSections();

                    // Output all items in the ItemNav menu
                    foreach($sections as $section) {
                        // Get each tab (ex. Inputs, Outputs, Gates, etc.)
                        $name  = $section["name"];
                        $dir   = $section["dir"];
                        $items = $section["items"];

                        $name2 = strtolower($name);

                        $return .= <<<HTML
                    <h4 id="itemnav-section-{$name2}" unselectable>{$name}</h4>
HTML;
                        foreach ($items as $item) {
                            // Get each item in the tab (ex. Button, Switch, etc.)
                            $displayName = $item["display"];
                            $imageName   = $item["img"];
                            $xmlId       = $item["xml"];

                            $not = "false";
                            if (isset($item["not"]))
                                $not = $item["not"];

                            $return .= <<<HTML
                            <button id="itemnav-section-{$name2}-button-{$xmlId}" type="button" data-xmlid="{$xmlId}" data-not="{$not}">
                                <img id="itemnav-section-{$name2}-img-{$xmlId}" src="img/icons/{$dir}/{$imageName}" alt="{$displayName}" />
                                <br/>{$displayName}
                            </button>
HTML;
                        }
                    }

                    $return .= <<<HTML
                </nav>
                <div id="itemnav-open-tab" class="tab"></div>

                <canvas id="canvas" class="canvas"></canvas>

                <div id="ic-designer" style="visibility: hidden;">
                    <canvas id="ic-canvas" class="icdesigner"></canvas>
                    <div class="icbuttons">
                        <button id="ic-confirmbutton" class="icbuttons__button" onclick="icdesigner.confirm();" alt="Submit IC">Confirm</button>
                        <button id="ic-cancelbutton"  class="icbuttons__button" onclick="icdesigner.cancel();"  alt="Cancel IC">Cancel</button>
                    </div>
                </div>

                <div id="popup" class="popup" tabindex="-1" style="visibility: hidden;">
                    <input id="popup-name" type="text" value="Name :" alt="Name of object(s)">
                    <hr/>
                    <div id="popup-pos-text" style="display: none;">Position
                        <label id="popup-position-label" class="popup__label" unselectable disabled>
                            <input id="popup-position-x" type="number" value="0" min="-10000" max="10000" step="0.5" alt="X-Position of object(s)" />
                            <input id="popup-position-y" type="number" value="0" min="-10000" max="10000" step="0.5" alt="Y-Position of object(s)" />
                        </label>
                    </div>
                    <div id="popup-input-count-text" style="display: none;">Input Count
                        <label id="popup-input-count-label" class="popup__label" unselectable disabled>
                            <input id="popup-input-count" type="number" value="2" min="2" max="8" step="1" alt="Number of inputs object(s) have" />
                        </label>
                    </div>
                    <div id="popup-output-count-text" style="display: none;">Output Count
                        <label id="popup-output-count-label" class="popup__label" unselectable disabled>
                            <input id="popup-output-count" type="number" value="2" min="2" max="8" step="1" alt="Number of outputs object(s) have" />
                        </label>
                    </div>
                    <div id="popup-color-text" style="display: none;">Color
                        <label id="popup-color-label" class="popup__label" unselectable disabled>
                            <input id="popup-color-picker" type="color" value="#ffffff" alt="Color of object(s)" />
                        </label>
                    </div>
                    <div id="popup-clock-delay-text" style="display: none;">Clock Delay
                        <label id="popup-clock-delay-label" class="popup__label" unselectable disabled>
                            <input id="popup-clock-delay" type="number" value="1000" min="200" max="10000" step="100" alt="Clock delay in milliseconds" />
                        </label>
                    </div>

                    <button id="popup-ic-button" type="button" alt="Create">Create IC</button>
                    <button id="popup-bus-button" type="button" alt="Create a bus between selected ports">Bus</button>
                </div>
            </main>
        </div>

        <script src="Bundle.js"></script>
    </body>

</html>
HTML;
        return $return;
    }

}
