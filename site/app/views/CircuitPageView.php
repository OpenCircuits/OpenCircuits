<?php

namespace app\views;

class CircuitPageView {

    public function getOutput($user, $config, $itemNavConfig) {
        $return = <<<HTML
<!DOCTYPE HTML>
<html>
    <head>
        <link rel="stylesheet" href="css/stylesheet.css">
    </head>
    <body>
        <div id="content" class="content">
            <header id="header">
                <div class="header__left">
                    <span id="header-open-side-nav-button" role="button" tabindex="0" class="header__left__sidenavbutton" onclick="SideNavController.toggle();">&#9776;</span>
                    <input id="header-project-name-input" class="header__left__projectname" type="text" value="Untitled Circuit*" alt="Name of project">
                </div>

                <div class="header__center">
                    <img id="logo" class="header__center__logo" src="img/icons/logo.svg" height="100%" alt="OpenCircuits logo" />
                </div>
                <div class="header__right">
                    <button type="button" onclick="document.getElementById('header-file-input').click();">
                        <img src="img/icons/open.svg" height="100%" alt="Open a file" />
                    </button>
                    <input id="header-file-input" type="file" name="name" style="display: none;" multiple="false" required="true" accept=".circuit,.xml" />
                    <button id="header-download-button" type="button">
                        <img src="img/icons/download.svg" height="100%" alt="Download current scene" />
                    </button>
                    <button id="header-download-pdf-button" type="button">
                        <img src="img/icons/pdf_download.svg" height="100%" alt="Save current scene as PDF" />
                    </button>
                    <button id="header-download-png-button" type="button">
                        <img src="img/icons/png_download.svg" height="100%" alt="Save current scene as PNG" />
                    </button>
                </div>
            </header>

            <main>
                <nav id="itemnav" class="itemnav">
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
                <div id="itemnav-open-tab" class="tab"> &#9776; </div>

                <canvas id="canvas" class="canvas"></canvas>
            </main>
        </div>

        <script src="Bundle.js"></script>
    </body>

</html>
HTML;
        return $return;
    }

}
