var PlaceItemController = (function() {
    var justDragged = false;
    var evt;

    return {
        place: function(item, not) {
            if (not)
                item.not = not;
            var rect = getCurrentContext().getInput().canvas.getBoundingClientRect();
            itemTool.activate(item, getCurrentContext());
            if (justDragged) {
                getCurrentContext().getInput().onMouseMove(evt);
                itemTool.onMouseMove(getCurrentContext().getInput())
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
