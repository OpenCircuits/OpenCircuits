var SideNavController = (function() {
    var tab = document.getElementById("open-sive-nav-button");
    var tab2 = document.getElementById("open-items-tab");
    var container = document.getElementById("sidenav");
    var otherContent = document.getElementById("content");
    var overlay = document.getElementById("overlay");
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

    return {
        disabled: false,
        isOpen: false,
        toggle: function() {
            if (this.isOpen) {
                this.isOpen = false;
                close();
            } else {
                this.isOpen = true;
                open();
            }
        },
        getWidth: function() {
            return (this.isOpen ? SIDENAV_WIDTH : 0);
        }
    }
})();
// SideNavController.toggle();
