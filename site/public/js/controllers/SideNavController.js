var SideNavController = (function() {
    var tab = document.getElementById("open-side-nav-button");
    var tab2 = document.getElementById("open-items-tab");
    var container = document.getElementById("sidenav");
    var otherContent = document.getElementById("content");
    var overlay = document.getElementById("overlay");
    var debugToggle = document.getElementById("debugToggle");
    if (overlay) {
        overlay.addEventListener("transitionend", function(event) {
            if (!SideNavController.isOpen)
                overlay.style.visibility = "hidden";        
        }, false);
    }
    
    var open = function() {
        container.style.width           = SIDENAV_WIDTH + "px";
        otherContent.style.marginLeft   = SIDENAV_WIDTH + "px";
        overlay.style.visibility        = "visible"; 
        overlay.style.opacity           = "1"; 
        overlay.onclick = function() { SideNavController.toggle(); }
    }
    var close = function() {
        container.style.width           = "0px";
        otherContent.style.marginLeft   = "0px";
        overlay.style.opacity           = "0"; 
        overlay.onclick = function() {  }
    }
    var activateDebugMode = function() {
        getCurrentContext().setMode(1);
        debugToggle.style.color = "#222";
        debugToggle.style.background = "#888";

        if(ItemNavController.isOpen){
            ItemNavController.toggle();
        }

        debugToggle.onclick = function() { SideNavController.toggleDebugMode(); }
    }
    var deactivateDebugMode = function() {
        getCurrentContext().setMode(0);
        debugToggle.style.color = "#888";
        debugToggle.style.background = "#222";
        debugToggle.onclick = function() { SideNavController.toggleDebugMode(); }
    }

    return {
        disabled: false,
        isOpen: false,
        debugModeOn: false,
        toggle: function() {
            if (this.isOpen) {
                this.isOpen = false;
                close();
            } else {
                this.isOpen = true;
                open();
            }
        },
        toggleDebugMode: function() {
            if (this.debugModeOn) {
                this.debugModeOn = false;
                activateDebugMode();
            } else {
                this.debugModeOn = true;
                deactivateDebugMode();
            }
        },
        getWidth: function() {
            return (this.isOpen ? SIDENAV_WIDTH : 0);
        }
    }
})();
// SideNavController.toggle();
