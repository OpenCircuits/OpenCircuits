var PlaceItemController = (function() {
    return {
        place: function(item, not) {
            if (not)
                item.not = not;
            var canvas = getCurrentContext().getRenderer().canvas;
            var rect = canvas.getBoundingClientRect();
            itemTool.activate(item, getCurrentContext());
        },
        onDragEnd: function(event) {
            event.srcElement.parentElement.onclick();
        }
    };
})();
