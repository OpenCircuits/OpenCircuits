class UIDManager {
    constructor(context) {
        this.context = context;
        this.counter = 0;
    }
    giveUIDTo(obj) {
        if (!obj.uid)
            obj.uid = (this.counter++);
    }
    redistribute() {
        var things = this.context.getObjects().concat(this.context.getWires());
        this.counter = 0;
        for (var i = 0; i < things.length; i++)
            things[i].uid = (this.counter++);
    }
}

/**
 * Finds and returns the thing in the given
 * array that has the given uid (Unique Identification)
 *
 * @param  {Array} things
 *         The group of things to search
 *
 * @param  {Integer} uid
 *         The target unique identification to search for
 *
 * @return {IOObject}
 *         The object with the given uid or undefined if
 *         the object is not found
 */
UIDManager.find = function(things, target) {
    for (var i = 0; i < things.length; i++) {
        if (things[i].uid === target)
            return things[i];
    }
    return undefined;
}
