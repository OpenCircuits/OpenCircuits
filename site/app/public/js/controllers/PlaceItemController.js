var PlaceItemController = (function() {
    var justDragged = false;
    var evt;

    return {
        place: function(item, not) {
            if (not)
                item.not = not;
            var canvas = getCurrentContext().getRenderer().canvas;
            var rect = canvas.getBoundingClientRect();
            itemTool.activate(item, getCurrentContext());
            if (justDragged) {
                // Input.onMouseMove(evt);
                itemTool.onMouseMove(Input)
                itemTool.onClick();
            }
            justDragged = false;
        },
        onDragEnd: function(event) {
            justDragged = true;
            evt = event;
            event.srcElement.parentElement.onclick();
        }
    };
})();
