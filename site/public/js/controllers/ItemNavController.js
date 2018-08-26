var ItemNavController = (function() {
    var tab = document.getElementById("open-items-tab");
    var container = document.getElementById("items");

    var open = function() {
        container.style.width       = ITEMNAV_WIDTH + "px";
        tab.style.marginLeft        = (ItemNavController.getTabOffset()) + "px";
        tab.style.borderColor       = "rgba(153, 153, 153, 0.0)";
        tab.style.backgroundColor   = "rgba(200, 200, 200, 0.0)";
        tab.style.fontSize          = "2.5em";
        tab.innerHTML               = "&times;";
    }
    var close = function() {
        container.style.width       = "0px";
        tab.style.marginLeft        = (ItemNavController.getTabOffset()) + "px";
        tab.style.borderColor       = "rgba(153, 153, 153, 0.7)";
        tab.style.backgroundColor   = "rgba(200, 200, 200, 0.7)";
        tab.style.fontSize          = "2em";
        tab.innerHTML               = "&#9776;";
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

            // if (popup)
            //     popup.onMove();
        },
        getTabOffset: function() {
            return (this.isOpen ? ITEMNAV_WIDTH - tab.offsetWidth : 0);
        }
    };
})();
// ItemNavController.toggle();
