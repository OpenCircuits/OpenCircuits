const dt = 16;

var updateRequests = 0;

class Propogation {
    constructor(sender, receiver, signal, update) {
        this.sender = sender;
        this.receiver = receiver;
        this.signal = signal;

        if (updateRequests === 0) {
            updateRequests++;
            setTimeout(update, dt);
        }
    }
    send() {
        this.receiver.activate(this.signal);
    }
}
