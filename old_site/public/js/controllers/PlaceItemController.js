var PlaceItemController = (function() {
    return {
        disabled: false,
        drag: false,
        place: function(item, not) {
            if (not)
                item.not = not;
            var canvas = getCurrentContext().getRenderer().canvas;
            var rect = canvas.getBoundingClientRect();
            itemTool.activate(item, getCurrentContext());
        },
        onDragEnd: function(event) {
            this.drag = true;
            event.srcElement.parentElement.onclick();
        }
    };
})();
