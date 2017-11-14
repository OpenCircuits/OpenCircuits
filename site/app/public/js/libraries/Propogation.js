/* Should be const instead of var
   but Safari does not allow it */
var PROPOGATION_TIME = 1;

var updateRequests = 0;

class Propogation {
    constructor(sender, receiver, signal, update) {
        this.sender = sender;
        this.receiver = receiver;
        this.signal = signal;

        if (updateRequests === 0) {
            updateRequests++;
            setTimeout(update, PROPOGATION_TIME);
        }
    }
    send() {
        this.receiver.activate(this.signal);
    }
}
