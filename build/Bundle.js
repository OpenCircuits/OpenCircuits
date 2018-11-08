(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var Images = require("./utils/Images"); // var ICDesignerController = require("./controllers/ICDesignerController");


var MainDesignerController = require("./controllers/MainDesignerController"); // var InputController = require("./utils/input/InputController");


function Start() {
  Load(Init);
}

function Load(onFinishLoading) {
  Images.Load(onFinishLoading);
}

function Init() {
  // Initialize all controllers
  MainDesignerController.Init(); // ICDesignerController.Init();

  MainDesignerController.Render(); // InputController.Init();
}

Start();

},{"./controllers/MainDesignerController":2,"./utils/Images":17}],2:[function(require,module,exports){
"use strict";

var V = require("../utils/math/Vector").V;

var CircuitDesigner = require("../models/CircuitDesigner");

var MainDesignerView = require("../views/MainDesignerView");

var Switch = require("../models/ioobjects/inputs/Switch");

var ANDGate = require("../models/ioobjects/gates/ANDGate");

var LED = require("../models/ioobjects/outputs/LED");

var MainDesignerController = function () {
  var designer;
  var view;
  return {
    Init: function Init() {
      designer = new CircuitDesigner();
      view = new MainDesignerView();
      var s1 = new Switch();
      var s2 = new Switch();
      var g1 = new ANDGate();
      var l1 = new LED();
      s1.setPos(V(-100, -100));
      s2.setPos(V(-100, 100));
      g1.setPos(V(0, 0));
      l1.setPos(V(100, 0));
      designer.addObjects([s1, s2, g1, l1]);
      designer.connect(s1, 0, g1, 0);
      designer.connect(s2, 0, g1, 1);
      designer.connect(g1, 0, l1, 0);
      s1.activate(true);
      console.log("LED active: " + l1.isOn().toString());
      s1.activate(false);
      s2.activate(true);
      console.log("LED active: " + l1.isOn().toString());
      s1.activate(true);
      console.log("LED active: " + l1.isOn().toString());
    },
    Render: function Render() {
      view.render(designer, []);
    }
  };
}();

module.exports = MainDesignerController;

},{"../models/CircuitDesigner":3,"../models/ioobjects/gates/ANDGate":11,"../models/ioobjects/inputs/Switch":12,"../models/ioobjects/outputs/LED":13,"../utils/math/Vector":21,"../views/MainDesignerView":27}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Propagation = require("./Propagation");

var IOObject = require("./ioobjects/IOObject");

var Component = require("./ioobjects/Component");

var Wire = require("./ioobjects/Wire");

var CircuitDesigner =
/*#__PURE__*/
function () {
  function CircuitDesigner() {
    _classCallCheck(this, CircuitDesigner);

    this.objects = [];
    this.wires = [];
    this.propagationQueue = [];
    this.updateRequests = 0;
  }

  _createClass(CircuitDesigner, [{
    key: "reset",
    value: function reset() {
      this.objects = [];
      this.wires = [];
      this.propagationQueue = [];
      this.updateRequests = 0;
    }
    /**
     * Add a propogation request to the queue.
     * Also checks if there are currently no requests and starts the cycle if
     *  there aren't
     * 
     * @param sender
     * @param receiver
     * @param signal
     */

  }, {
    key: "propogate",
    value: function propogate(receiver, signal) {
      this.propagationQueue.push(new Propagation(receiver, signal));

      if (this.updateRequests == 0) {
        this.updateRequests++; // setTimeout(update, PROPAGATION_TIME);

        this.update();
      }
    }
    /**
     * 
     * @return True if the updated component(s) require rendering
     */

  }, {
    key: "update",
    value: function update() {
      // Create temp queue before sending, in the case that sending them triggers
      //   more propagations to occur 
      var tempQueue = [];

      while (this.propagationQueue.length > 0) {
        tempQueue.push(this.propagationQueue.pop());
      }

      while (tempQueue.length > 0) {
        tempQueue.pop().send();
      } // If something else was added during the sending, add request


      if (this.propagationQueue.length > 0) this.updateRequests++;
      this.updateRequests--;

      if (this.updateRequests > 0) {
        // setTimeout(update, PROPAGATION_TIME)
        this.update();
      }

      return true;
    }
  }, {
    key: "addObjects",
    value: function addObjects(objects) {
      for (var i = 0; i < objects.length; i++) {
        this.addObject(objects[i]);
      }
    }
  }, {
    key: "addObject",
    value: function addObject(obj) {
      if (this.objects.includes(obj)) throw new Error("Attempted to add object that already existed!");
      obj.setDesigner(this);
      this.objects.push(obj);
    }
  }, {
    key: "connect",
    value: function connect(c1, i1, c2, i2) {
      var wire = new Wire(c1.getOutput(i1), c2.getInput(i2));
      this.wires.push(wire);
      c1.connect(i1, wire);
      c2.setInput(i2, wire);
    }
  }, {
    key: "removeObject",
    value: function removeObject(obj) {
      if (!this.objects.includes(obj)) throw new Error("Attempted to remove object that doesn't exist!"); // completely disconnect from the circuit
    }
  }, {
    key: "getObjects",
    value: function getObjects() {
      return this.objects;
    }
  }, {
    key: "getWires",
    value: function getWires() {
      return this.wires;
    }
  }]);

  return CircuitDesigner;
}();

module.exports = CircuitDesigner;

},{"./Propagation":4,"./ioobjects/Component":5,"./ioobjects/IOObject":7,"./ioobjects/Wire":10}],4:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var IOObject = require("./ioobjects/IOObject");

var Propagation =
/*#__PURE__*/
function () {
  function Propagation(receiver, signal) {
    _classCallCheck(this, Propagation);

    this.receiver = receiver;
    this.signal = signal;
  }

  _createClass(Propagation, [{
    key: "send",
    value: function send() {
      this.receiver.activate(this.signal);
    }
  }]);

  return Propagation;
}();

module.exports = Propagation;

},{"./ioobjects/IOObject":7}],5:[function(require,module,exports){
"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var Vector = require("../../utils/math/Vector");

var Transform = require("../../utils/math/Transform");

var V = Vector.V;

var IOObject = require("./IOObject");

var Wire = require("./Wire");

var InputPort = require("./InputPort");

var OutputPort = require("./OutputPort");

var Component =
/*#__PURE__*/
function (_IOObject) {
  _inherits(Component, _IOObject); // constructor(context, x, y, w, h, img, isPressable, maxInputs, maxOutputs, selectionBoxWidth, selectionBoxHeight) {


  function Component(numInputs, numOutputs, isPressable) {
    var _this;

    var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : V(1, 1);

    _classCallCheck(this, Component);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Component).call(this));
    _this.inputs = [];
    _this.outputs = [];
    _this.transform = new Transform(V(0, 0), size, 0); // Create and initialize each port

    for (var i = 0; i < numInputs; i++) {
      _this.inputs.push(new InputPort(_assertThisInitialized(_assertThisInitialized(_this))));
    }

    for (var i = 0; i < numOutputs; i++) {
      _this.outputs.push(new OutputPort(_assertThisInitialized(_assertThisInitialized(_this))));
    }

    return _this;
  } // @Override


  _createClass(Component, [{
    key: "activate",
    value: function activate(signal) {
      var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0; // Don't try to activate an Output component since it has no outputs

      if (this.outputs.length == 0) return;
      this.outputs[i].activate(signal);
    }
  }, {
    key: "connect",
    value: function connect(i, w) {
      this.outputs[i].connect(w);
    }
  }, {
    key: "setInput",
    value: function setInput(i, w) {
      this.inputs[i].setInput(w);
    }
  }, {
    key: "setPos",
    value: function setPos(v) {
      this.transform.setPos(v);
    }
  }, {
    key: "getInput",
    value: function getInput(i) {
      return this.inputs[i];
    }
  }, {
    key: "getInputCount",
    value: function getInputCount() {
      return this.inputs.length;
    }
  }, {
    key: "getOutput",
    value: function getOutput(i) {
      return this.outputs[i];
    }
  }, {
    key: "getOutputCount",
    value: function getOutputCount() {
      return this.outputs.length;
    }
  }, {
    key: "getTransform",
    value: function getTransform() {
      return this.transform;
    }
  }, {
    key: "getImageName",
    value: function getImageName() {
      return "base.svg";
    }
  }]);

  return Component;
}(IOObject);

module.exports = Component;

},{"../../utils/math/Transform":20,"../../utils/math/Vector":21,"./IOObject":7,"./InputPort":8,"./OutputPort":9,"./Wire":10}],6:[function(require,module,exports){
"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

var Vector = require("../../utils/math/Vector");

var V = Vector.V;

var Component = require("./Component");

var Gate =
/*#__PURE__*/
function (_Component) {
  _inherits(Gate, _Component);

  function Gate(numInputs, numOutputs) {
    var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : V(1, 1);

    _classCallCheck(this, Gate);

    return _possibleConstructorReturn(this, _getPrototypeOf(Gate).call(this, numInputs, numOutputs, false, size));
  }

  return Gate;
}(Component);

module.exports = Gate;

},{"../../utils/math/Vector":21,"./Component":5}],7:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var CircuitDesigner = require("../CircuitDesigner");

var IOObject =
/*#__PURE__*/
function () {
  function IOObject() {
    _classCallCheck(this, IOObject);
  }

  _createClass(IOObject, [{
    key: "activate",
    value: function activate(signal) {
      var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    }
  }, {
    key: "setDesigner",
    value: function setDesigner(designer) {
      this.designer = designer;
    }
  }, {
    key: "getDesigner",
    value: function getDesigner() {
      return this.designer;
    }
  }]);

  return IOObject;
}();

module.exports = IOObject;

},{"../CircuitDesigner":3}],8:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var IO_PORT_LENGTH = require("../../utils/Constants").IO_PORT_LENGTH;

var Vector = require("../../utils/math/Vector");

var V = Vector.V;

var Component = require("./Component");

var Wire = require("./Wire");

var InputPort =
/*#__PURE__*/
function () {
  function InputPort(parent) {
    _classCallCheck(this, InputPort);

    this.parent = parent;
    this.input = undefined;
    this.isOn = false;
    this.origin = V(0, 0);
    this.target = V(-IO_PORT_LENGTH, 0);
  }

  _createClass(InputPort, [{
    key: "activate",
    value: function activate(signal) {
      // Don't do anything if signal is same as current state
      if (signal == this.isOn) return;
      this.isOn = signal;
      this.parent.getDesigner().propogate(this.parent, this.isOn);
    }
  }, {
    key: "setInput",
    value: function setInput(input) {
      this.input = input;
    }
  }, {
    key: "getOrigin",
    value: function getOrigin() {
      return this.origin;
    }
  }, {
    key: "getTarget",
    value: function getTarget() {
      return this.target;
    }
  }]);

  return InputPort;
}();

module.exports = InputPort;

},{"../../utils/Constants":16,"../../utils/math/Vector":21,"./Component":5,"./Wire":10}],9:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var IO_PORT_LENGTH = require("../../utils/Constants").IO_PORT_LENGTH;

var Vector = require("../../utils/math/Vector");

var V = Vector.V;

var Component = require("./Component");

var Wire = require("./Wire");

var OutputPort =
/*#__PURE__*/
function () {
  function OutputPort(parent) {
    _classCallCheck(this, OutputPort);

    this.parent = parent;
    this.connections = [];
    this.isOn = false;
    this.origin = V(0, 0);
    this.target = V(IO_PORT_LENGTH, 0);
  }

  _createClass(OutputPort, [{
    key: "activate",
    value: function activate(signal) {
      // Don't do anything if signal is same as current state
      if (signal == this.isOn) return;
      this.isOn = signal;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.connections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var w = _step.value;
          this.parent.getDesigner().propogate(w, this.isOn);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "connect",
    value: function connect(w) {
      this.connections.push(w);
    }
  }, {
    key: "getOrigin",
    value: function getOrigin() {
      return this.origin;
    }
  }, {
    key: "getTarget",
    value: function getTarget() {
      return this.target;
    }
  }]);

  return OutputPort;
}();

module.exports = OutputPort;

},{"../../utils/Constants":16,"../../utils/math/Vector":21,"./Component":5,"./Wire":10}],10:[function(require,module,exports){
"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

var IOObject = require("./IOObject");

var OutputPort = require("./OutputPort");

var InputPort = require("./InputPort");

var Wire =
/*#__PURE__*/
function (_IOObject) {
  _inherits(Wire, _IOObject);

  function Wire(input, output) {
    var _this;

    _classCallCheck(this, Wire);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Wire).call(this));
    _this.input = input;
    _this.output = output;
    return _this;
  } // @Override


  _createClass(Wire, [{
    key: "activate",
    value: function activate(signal) {
      // Don't do anything if signal is same as current state
      if (signal == this.isOn) return;
      this.isOn = signal;
      if (this.output != null) this.output.activate(signal);
    }
  }, {
    key: "setInput",
    value: function setInput(c) {
      this.input = c;
    }
  }, {
    key: "setOutput",
    value: function setOutput(c) {
      this.output = c;
    }
  }]);

  return Wire;
}(IOObject);

module.exports = Wire;

},{"./IOObject":7,"./InputPort":8,"./OutputPort":9}],11:[function(require,module,exports){
"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

var V = require("../../../utils/math/Vector").V;

var Gate = require("../Gate");

var ANDGate =
/*#__PURE__*/
function (_Gate) {
  _inherits(ANDGate, _Gate);

  function ANDGate() {
    _classCallCheck(this, ANDGate);

    return _possibleConstructorReturn(this, _getPrototypeOf(ANDGate).call(this, 2, 1, V(60, 60)));
  } // @Override


  _createClass(ANDGate, [{
    key: "activate",
    value: function activate(signal) {
      var on = true;

      for (var i = 0; i < this.inputs.length; i++) {
        on = on && this.inputs[i].isOn;
      }

      _get(_getPrototypeOf(ANDGate.prototype), "activate", this).call(this, on);
    }
  }, {
    key: "getDisplayName",
    value: function getDisplayName() {
      return this.not ? "NAND Gate" : "AND Gate";
    }
  }, {
    key: "getImageName",
    value: function getImageName() {
      return "and.svg";
    }
  }], [{
    key: "getXMLName",
    value: function getXMLName() {
      return "andgate";
    }
  }]);

  return ANDGate;
}(Gate);

module.exports = ANDGate;

},{"../../../utils/math/Vector":21,"../Gate":6}],12:[function(require,module,exports){
"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

var V = require("../../../utils/math/Vector").V;

var Component = require("../Component");

var Switch =
/*#__PURE__*/
function (_Component) {
  _inherits(Switch, _Component);

  function Switch() {
    _classCallCheck(this, Switch);

    return _possibleConstructorReturn(this, _getPrototypeOf(Switch).call(this, 0, 1, true, V(60, 60)));
  } // @Override


  _createClass(Switch, [{
    key: "activate",
    value: function activate(signal) {
      _get(_getPrototypeOf(Switch.prototype), "activate", this).call(this, signal, 0);
    }
  }, {
    key: "getImageName",
    value: function getImageName() {
      return "switchUp.svg";
    }
  }]);

  return Switch;
}(Component);

module.exports = Switch;

},{"../../../utils/math/Vector":21,"../Component":5}],13:[function(require,module,exports){
"use strict";

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

var V = require("../../../utils/math/Vector").V;

var Component = require("../Component");

var LED =
/*#__PURE__*/
function (_Component) {
  _inherits(LED, _Component);

  function LED() {
    _classCallCheck(this, LED);

    return _possibleConstructorReturn(this, _getPrototypeOf(LED).call(this, 1, 0, false, V(60, 60)));
  }

  _createClass(LED, [{
    key: "isOn",
    value: function isOn() {
      return this.inputs[0].isOn;
    }
  }, {
    key: "getImageName",
    value: function getImageName() {
      return "led.svg";
    }
  }]);

  return LED;
}(Component);

module.exports = LED;

},{"../../../utils/math/Vector":21,"../Component":5}],14:[function(require,module,exports){
"use strict"; // Code from https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser

function getBrowser() {
  if (navigator == undefined) return {
    name: "unknown",
    version: "unknown"
  };
  var ua = navigator.userAgent,
      tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {
      name: 'IE',
      version: tem[1] || ''
    };
  }

  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);

    if (tem != null) {
      return {
        name: 'Opera',
        version: tem[1]
      };
    }
  }

  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  tem = tem = ua.match(/version\/(\d+)/i);

  if (tem != null) {
    M.splice(1, 1, tem[1]);
  }

  return {
    name: M[0],
    version: M[1]
  };
}

module.exports = getBrowser();

},{}],15:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Vector = require("./math/Vector");

var V = Vector.V;

var Transform = require("./math/Transform");

var Matrix2x3 = require("./math/Matrix");

var TransformContains = require("./math/MathUtils").TransformContains;

var Camera =
/*#__PURE__*/
function () {
  function Camera(width, height) {
    var startPos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : V(0, 0);
    var startZoom = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    _classCallCheck(this, Camera);

    this.width = width;
    this.height = height;
    this.pos = startPos;
    this.zoom = startZoom;
    this.center = V(0, 0);
    this.transform = new Transform(V(0, 0), V(0, 0), 0);
    this.dirty = true;
  }

  _createClass(Camera, [{
    key: "resize",
    value: function resize(width, height) {
      this.width = width;
      this.height = height;
      this.center = V(this.width, this.height).scale(0.5);
    }
  }, {
    key: "updateMatrix",
    value: function updateMatrix() {
      if (!this.dirty) return;
      this.dirty = false;
      this.mat = new Matrix2x3();
      this.mat.translate(this.pos);
      this.mat.scale(V(this.zoom, this.zoom));
      this.inv = this.mat.inverse();
      var p1 = this.getWorldPos(V(0, 0));
      var p2 = this.getWorldPos(V(this.width, this.height));
      this.transform.setPos(p2.add(p1).scale(0.5));
      this.transform.setSize(p2.sub(p1));
    }
  }, {
    key: "translate",
    value: function translate(dx, dy) {
      this.dirty = true;
      this.pos.x += dx;
      this.pos.y += dy;
    }
  }, {
    key: "zoomBy",
    value: function zoomBy(s) {
      this.dirty = true;
      this.zoom *= s;
    }
  }, {
    key: "cull",
    value: function cull(transform) {
      // getCurrentContext().getRenderer().save();
      // transform.transformCtx(getCurrentContext().getRenderer().context);
      // getCurrentContext().getRenderer().rect(0, 0, transform.size.x, transform.size.y, '#ff00ff');
      // getCurrentContext().getRenderer().restore();
      return TransformContains(transform, this.getTransform());
    }
  }, {
    key: "getTransform",
    value: function getTransform() {
      this.updateMatrix();
      return this.transform;
    }
  }, {
    key: "getMatrix",
    value: function getMatrix() {
      this.updateMatrix();
      return this.mat;
    }
  }, {
    key: "getInverseMatrix",
    value: function getInverseMatrix() {
      this.updateMatrix();
      return this.inv;
    }
  }, {
    key: "getScreenPos",
    value: function getScreenPos(v) {
      return this.getInverseMatrix().mul(v).add(this.center);
    }
  }, {
    key: "getWorldPos",
    value: function getWorldPos(v) {
      return this.getMatrix().mul(v.sub(this.center));
    }
  }]);

  return Camera;
}();

module.exports = Camera;

},{"./math/MathUtils":18,"./math/Matrix":19,"./math/Transform":20,"./math/Vector":21}],16:[function(require,module,exports){
"use strict";

var Constants = {};
Constants.DEFAULT_SIZE = 50;
Constants.GRID_SIZE = 50;
Constants.DEFAULT_FILL_COLOR = "#ffffff";
Constants.DEFAULT_BORDER_COLOR = "#000000";
Constants.DEFAULT_ON_COLOR = "#3cacf2";
Constants.SELECTED_FILL_COLOR = "#1cff3e";
Constants.SELECTED_BORDER_COLOR = "#0d7f1f";
Constants.IO_PORT_LENGTH = 60;
Constants.IO_PORT_RADIUS = 7;
Constants.IO_PORT_BORDER_WIDTH = 1;
Constants.IO_PORT_LINE_WIDTH = 2;
Constants.WIRE_DIST_THRESHOLD = 5;
Constants.WIRE_DIST_THRESHOLD2 = Math.pow(Constants.WIRE_DIST_THRESHOLD, 2);
Constants.WIRE_DIST_ITERATIONS = 10;
Constants.WIRE_NEWTON_ITERATIONS = 5;
Constants.WIRE_SNAP_THRESHOLD = 10;
Constants.ROTATION_CIRCLE_RADIUS = 75;
Constants.ROTATION_CIRCLE_THICKNESS = 5;
Constants.ROTATION_CIRCLE_THRESHOLD = 5;
Constants.ROTATION_CIRCLE_R1 = Math.pow(Constants.ROTATION_CIRCLE_RADIUS - Constants.ROTATION_CIRCLE_THRESHOLD, 2);
Constants.ROTATION_CIRCLE_R2 = Math.pow(Constants.ROTATION_CIRCLE_RADIUS + Constants.ROTATION_CIRCLE_THRESHOLD, 2);
Constants.SIDENAV_WIDTH = 200;
Constants.ITEMNAV_WIDTH = 200;
Constants.LEFT_MOUSE_BUTTON = 0;
Constants.RIGHT_MOUSE_BUTTON = 1;
Constants.OPTION_KEY = 18;
Constants.SHIFT_KEY = 16;
Constants.BACKSPACE_KEY = 8;
Constants.DELETE_KEY = 46;
Constants.ENTER_KEY = 13;
Constants.ESC_KEY = 27;
Constants.A_KEY = 65;
Constants.C_KEY = 67;
Constants.V_KEY = 86;
Constants.X_KEY = 88;
Constants.Y_KEY = 89;
Constants.Z_KEY = 90;
Constants.CONTROL_KEY = 17;
Constants.COMMAND_KEY = 91;
module.exports = Constants;

},{}],17:[function(require,module,exports){
"use strict"; // 

var Images = function () {
  var images = [];

  var loadImages = function loadImages(imageNames, index, onFinish) {
    var img = new Image(); //Object.create(Image);

    img.onload = function () {
      images[imageNames[index]] = img;
      img.dx = 0;
      img.dy = 0;
      img.ratio = img.width / img.height;
      if (index === imageNames.length - 1) onFinish();else loadImages(imageNames, index + 1, onFinish);
    };

    img.src = "img/items/" + imageNames[index];
    console.log(img.src);
  };

  return {
    Load: function Load(onFinishLoading) {
      loadImages(["constLow.svg", "constHigh.svg", "buttonUp.svg", "buttonDown.svg", "switchUp.svg", "switchDown.svg", "led.svg", "ledLight.svg", "buffer.svg", "and.svg", "or.svg", "xor.svg", "segment1.svg", "segment2.svg", "segment3.svg", "segment4.svg", "clock.svg", "clockOn.svg", "keyboard.svg", "base.svg"], 0, onFinishLoading);
    },
    GetImage: function GetImage(img) {
      return images[img];
    }
  };
}();

module.exports = Images;

},{}],18:[function(require,module,exports){
"use strict";

var Transform = require("./Transform");

var MathUtils = function () {
  return {
    /**
     * Compares two transforms to see if they overlap.
     * First tests it using a quick circle-circle
     * intersection using the 'radius' of the transform
     *
     * Then uses a SAT (Separating Axis Theorem) method
     * to determine whether or not the two transforms
     * are intersecting
     *
     * @param  {Transform} a
     *         The first transform
     *
     * @param  {Transform} b
     *         The second transform
     *
     * @return {Boolean}
     *         True if the two transforms are overlapping,
     *         false otherwise
     */
    TransformContains: function TransformContains(A, B) {
      // If both transforms are non-rotated
      if (Math.abs(A.getAngle()) <= 1e-5 && Math.abs(B.getAngle()) <= 1e-5) {
        var aPos = A.getPos(),
            aSize = A.getSize();
        var bPos = B.getPos(),
            bSize = B.getSize();
        return Math.abs(aPos.x - bPos.x) * 2 < aSize.x + bSize.x && Math.abs(aPos.y - bPos.y) * 2 < aSize.y + bSize.y;
      } // Quick check circle-circle intersection


      var r1 = A.getRadius();
      var r2 = B.getRadius();
      var sr = r1 + r2; // Sum of radius

      var dpos = A.getPos().sub(B.getPos()); // Delta position

      if (dpos.dot(dpos) > sr * sr) return false;
      /* Perform SAT */
      // Get corners in local space of transform A

      var a = A.getLocalCorners(); // Transform B's corners into A local space

      var bworld = B.getCorners();
      var b = [];

      for (var i = 0; i < 4; i++) {
        b[i] = A.toLocalSpace(bworld[i]); // Offsets x and y to fix perfect lines
        // where b[0] = b[1] & b[2] = b[3]

        b[i].x += 0.0001 * i;
        b[i].y += 0.0001 * i;
      }

      var corners = a.concat(b);
      var minA, maxA, minB, maxB; // SAT w/ x-axis
      // Axis is <1, 0>
      // So dot product is just the x-value

      minA = maxA = corners[0].x;
      minB = maxB = corners[4].x;

      for (var j = 1; j < 4; j++) {
        minA = Math.min(corners[j].x, minA);
        maxA = Math.max(corners[j].x, maxA);
        minB = Math.min(corners[j + 4].x, minB);
        maxB = Math.max(corners[j + 4].x, maxB);
      }

      if (maxA < minB || maxB < minA) return false; // SAT w/ y-axis
      // Axis is <1, 0>
      // So dot product is just the y-value

      minA = maxA = corners[0].y;
      minB = maxB = corners[4].y;

      for (var j = 1; j < 4; j++) {
        minA = Math.min(corners[j].y, minA);
        maxA = Math.max(corners[j].y, maxA);
        minB = Math.min(corners[j + 4].y, minB);
        maxB = Math.max(corners[j + 4].y, maxB);
      }

      if (maxA < minB || maxB < minA) return false; // SAT w/ other two axes

      var normals = [b[3].sub(b[0]), b[3].sub(b[2])];

      for (var i = 0; i < normals.length; i++) {
        var normal = normals[i];
        var minA = Infinity,
            maxA = -Infinity;
        var minB = Infinity,
            maxB = -Infinity;

        for (var j = 0; j < 4; j++) {
          var s = corners[j].dot(normal);
          minA = Math.min(s, minA);
          maxA = Math.max(s, maxA);
          var s2 = corners[j + 4].dot(normal);
          minB = Math.min(s2, minB);
          maxB = Math.max(s2, maxB);
        }

        if (maxA < minB || maxB < minA) return false;
      }

      return true;
    }
  };
}();

module.exports = MathUtils;

},{"./Transform":20}],19:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Vector = require("./Vector");

var V = Vector.V;

var Matrix2x3 =
/*#__PURE__*/
function () {
  function Matrix2x3(other) {
    _classCallCheck(this, Matrix2x3);

    this.mat = [];
    this.identity();

    if (other instanceof Matrix2x3) {
      for (var i = 0; i < 2 * 3; i++) {
        this.mat[i] = other.mat[i];
      }
    }
  }

  _createClass(Matrix2x3, [{
    key: "zero",
    value: function zero() {
      for (var i = 0; i < 2 * 3; i++) {
        this.mat[i] = 0;
      }

      return this;
    }
  }, {
    key: "identity",
    value: function identity() {
      this.zero();
      this.mat[0] = 1.0;
      this.mat[3] = 1.0;
      return this;
    }
  }, {
    key: "mul",
    value: function mul(v) {
      var result = V(0, 0);
      result.x = this.mat[0] * v.x + this.mat[2] * v.y + this.mat[4];
      result.y = this.mat[1] * v.x + this.mat[3] * v.y + this.mat[5];
      return result;
    }
  }, {
    key: "mult",
    value: function mult(m) {
      var result = new Matrix2x3();
      result.mat[0] = this.mat[0] * m.mat[0] + this.mat[2] * m.mat[1];
      result.mat[1] = this.mat[1] * m.mat[0] + this.mat[3] * m.mat[1];
      result.mat[2] = this.mat[0] * m.mat[2] + this.mat[2] * m.mat[3];
      result.mat[3] = this.mat[1] * m.mat[2] + this.mat[3] * m.mat[3];
      result.mat[4] = this.mat[0] * m.mat[4] + this.mat[2] * m.mat[5] + this.mat[4];
      result.mat[5] = this.mat[1] * m.mat[4] + this.mat[3] * m.mat[5] + this.mat[5];
      return result;
    }
  }, {
    key: "translate",
    value: function translate(v) {
      this.mat[4] += this.mat[0] * v.x + this.mat[2] * v.y;
      this.mat[5] += this.mat[1] * v.x + this.mat[3] * v.y;
    }
  }, {
    key: "rotate",
    value: function rotate(theta) {
      var c = Math.cos(theta);
      var s = Math.sin(theta);
      var m11 = this.mat[0] * c + this.mat[2] * s;
      var m12 = this.mat[1] * c + this.mat[3] * s;
      var m21 = this.mat[0] * -s + this.mat[2] * c;
      var m22 = this.mat[1] * -s + this.mat[3] * c;
      this.mat[0] = m11;
      this.mat[1] = m12;
      this.mat[2] = m21;
      this.mat[3] = m22;
    }
  }, {
    key: "scale",
    value: function scale(s) {
      this.mat[0] *= s.x;
      this.mat[1] *= s.x;
      this.mat[2] *= s.y;
      this.mat[3] *= s.y;
    }
  }, {
    key: "inverse",
    value: function inverse() {
      var inv = new Array(3 * 2);
      var det;
      inv[0] = this.mat[3];
      inv[1] = -this.mat[1];
      inv[2] = -this.mat[2];
      inv[3] = this.mat[0];
      inv[4] = this.mat[2] * this.mat[5] - this.mat[4] * this.mat[3];
      inv[5] = this.mat[4] * this.mat[1] - this.mat[0] * this.mat[5];
      det = this.mat[0] * this.mat[3] - this.mat[1] * this.mat[2];
      if (det == 0) return new Matrix2x3();
      det = 1.0 / det;
      var m = new Matrix2x3();

      for (var i = 0; i < 2 * 3; i++) {
        m.mat[i] = inv[i] * det;
      }

      return m;
    }
  }, {
    key: "print",
    value: function print() {
      console.log("[" + this.mat[0].toFixed(3) + ", " + this.mat[2].toFixed(3) + ", " + this.mat[4].toFixed(3) + "]\n" + "[" + this.mat[1].toFixed(3) + ", " + this.mat[3].toFixed(3) + ", " + this.mat[5].toFixed(3) + "]");
    }
  }, {
    key: "copy",
    value: function copy() {
      return new Matrix2x3(this);
    }
  }]);

  return Matrix2x3;
}();

module.exports = Matrix2x3;

},{"./Vector":21}],20:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Vector = require("./Vector");

var Matrix2x3 = require("./Matrix");

var V = Vector.V;

var Transform =
/*#__PURE__*/
function () {
  function Transform(pos, size) {
    var angle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, Transform);

    this.parent = undefined;
    this.pos = V(pos.x, pos.y);
    this.size = V(size.x, size.y);
    this.angle = angle;
    this.scale = V(1, 1);
    this.corners = [];
    this.localCorners = [];
    this.dirty = true;
    this.dirtySize = true;
    this.dirtyCorners = true;
    this.updateMatrix();
  }

  _createClass(Transform, [{
    key: "updateMatrix",
    value: function updateMatrix() {
      if (!this.dirty) return;
      this.dirty = false;
      this.matrix = new Matrix2x3();
      this.matrix.translate(this.pos);
      this.matrix.rotate(this.angle);
      this.matrix.scale(this.scale);
      if (this.parent != undefined) this.matrix = this.parent.getMatrix().mult(this.matrix);
      this.inverse = this.matrix.inverse();
    }
  }, {
    key: "updateSize",
    value: function updateSize() {
      if (!this.dirtySize) return;
      this.dirtySize = false;
      this.localCorners = [this.size.scale(V(-0.5, 0.5)), this.size.scale(V(0.5, 0.5)), this.size.scale(V(0.5, -0.5)), this.size.scale(V(-0.5, -0.5))];
      this.radius = Math.sqrt(this.size.x * this.size.x + this.size.y * this.size.y) / 2;
    }
  }, {
    key: "updateCorners",
    value: function updateCorners() {
      if (!this.dirtyCorners) return;
      this.dirtyCorners = false;
      var corners = this.getLocalCorners();

      for (var i = 0; i < 4; i++) {
        this.corners[i] = this.toWorldSpace(corners[i]);
      }
    }
  }, {
    key: "rotateAbout",
    value: function rotateAbout(a, c) {
      this.setAngle(a);
      this.setPos(this.pos.sub(c));
      var cos = Math.cos(a),
          sin = Math.sin(a);
      var xx = this.pos.x * cos - this.pos.y * sin;
      var yy = this.pos.y * cos + this.pos.x * sin;
      this.setPos(V(xx, yy).add(c));
      this.dirty = true;
      this.dirtyCorners = true;
    }
  }, {
    key: "setParent",
    value: function setParent(t) {
      this.parent = t;
      this.dirty = true;
      this.dirtyCorners = true;
    } // setCamera(c) {
    //     this.camera = c;
    // }

  }, {
    key: "setPos",
    value: function setPos(p) {
      this.pos.x = p.x;
      this.pos.y = p.y;
      this.dirty = true;
      this.dirtyCorners = true;
    }
  }, {
    key: "setAngle",
    value: function setAngle(a) {
      this.angle = a;
      this.dirty = true;
      this.dirtyCorners = true;
    }
  }, {
    key: "setScale",
    value: function setScale(s) {
      this.scale.x = s.x;
      this.scale.y = s.y;
      this.dirty = true;
    }
  }, {
    key: "setSize",
    value: function setSize(s) {
      this.size.x = s.x;
      this.size.y = s.y;
      this.dirtySize = true;
      this.dirtyCorners = true;
    }
  }, {
    key: "setWidth",
    value: function setWidth(w) {
      this.size.x = w;
      this.dirtySize = true;
      this.dirtyCorners = true;
    }
  }, {
    key: "setHeight",
    value: function setHeight(h) {
      this.size.y = h;
      this.dirtySize = true;
      this.dirtyCorners = true;
    }
  }, {
    key: "toLocalSpace",
    value: function toLocalSpace(v) {
      // v must be in world coords
      return this.getInverseMatrix().mul(v);
    }
  }, {
    key: "toWorldSpace",
    value: function toWorldSpace(v) {
      // v must be in local coords
      return this.getMatrix().mul(v);
    }
  }, {
    key: "getPos",
    value: function getPos() {
      return V(this.pos.x, this.pos.y);
    }
  }, {
    key: "getAngle",
    value: function getAngle() {
      return this.angle;
    }
  }, {
    key: "getScale",
    value: function getScale() {
      return V(this.scale.x, this.scale.y);
    }
  }, {
    key: "getSize",
    value: function getSize() {
      return this.size;
    }
  }, {
    key: "getRadius",
    value: function getRadius() {
      this.updateSize();
      return this.radius;
    }
  }, {
    key: "getMatrix",
    value: function getMatrix() {
      this.updateMatrix();
      return this.matrix;
    }
  }, {
    key: "getInverseMatrix",
    value: function getInverseMatrix() {
      this.updateMatrix();
      return this.inverse;
    }
  }, {
    key: "getBottomLeft",
    value: function getBottomLeft() {
      this.updateCorners();
      return this.corners[0];
    }
  }, {
    key: "getBottomRight",
    value: function getBottomRight() {
      this.updateCorners();
      return this.corners[1];
    }
  }, {
    key: "getTopRight",
    value: function getTopRight() {
      this.updateCorners();
      return this.corners[2];
    }
  }, {
    key: "getTopLeft",
    value: function getTopLeft() {
      this.updateCorners();
      return this.corners[3];
    }
  }, {
    key: "getCorners",
    value: function getCorners() {
      this.updateCorners();
      return this.corners;
    }
  }, {
    key: "getLocalCorners",
    value: function getLocalCorners() {
      this.updateSize();
      return this.localCorners;
    }
  }, {
    key: "equals",
    value: function equals(other) {
      var m1 = this.getMatrix().mat;
      var m2 = other.getMatrix().mat;

      for (var i = 0; i < m1.length; i++) {
        if (m1[i] !== m2[i]) return false;
      }

      return true;
    }
  }, {
    key: "print",
    value: function print() {
      this.updateMatrix();
      this.matrix.print();
    }
  }, {
    key: "copy",
    value: function copy() {
      var trans = new Transform(this.pos.copy(), this.size.copy(), this.angle);
      trans.scale = this.scale.copy();
      trans.dirty = true;
      return trans;
    }
  }]);

  return Transform;
}();

module.exports = Transform;

},{"./Matrix":19,"./Vector":21}],21:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Vector =
/*#__PURE__*/
function () {
  function Vector(x, y) {
    _classCallCheck(this, Vector);

    this.set(x, y);
  }

  _createClass(Vector, [{
    key: "set",
    value: function set(x, y) {
      if (x instanceof Vector) {
        this.x = x.x ? x.x : 0;
        this.y = x.y ? x.y : 0;
      } else if (y != null) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
      } else {
        throw new Error("Undefined parameters passed to Vector.set! ${x}, ${y}");
      }
    }
  }, {
    key: "translate",
    value: function translate(dx, dy) {
      if (dx instanceof Vector) this.set(this.add(dx));else if (dy != null) this.set(this.x + dx, this.y + dy);else throw new Error("Undefined parameters passed to Vector.translate! ${dx}, ${dy}");
    }
  }, {
    key: "add",
    value: function add(x, y) {
      if (x instanceof Vector) return new Vector(this.x + x.x, this.y + x.y);
      if (y != null) return new Vector(this.x + x, this.y + y);
      throw new Error("Undefined parameters passed to Vector.add! ${x}, ${y}");
    }
  }, {
    key: "sub",
    value: function sub(x, y) {
      if (x instanceof Vector) return new Vector(this.x - x.x, this.y - x.y);
      if (y != null) return new Vector(this.x - x, this.y - y);
      throw new Error("Undefined parameters passed to Vector.sub! ${x}, ${y}");
    }
  }, {
    key: "scale",
    value: function scale(a) {
      if (a instanceof Vector) return new Vector(a.x * this.x, a.y * this.y);
      return new Vector(a * this.x, a * this.y);
    }
  }, {
    key: "normalize",
    value: function normalize() {
      var len = this.len();

      if (len === 0) {
        return new Vector(0, 0);
      } else {
        var invLen = 1 / len;
        return new Vector(this.x * invLen, this.y * invLen);
      }
    }
  }, {
    key: "len",
    value: function len() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }, {
    key: "len2",
    value: function len2() {
      return this.x * this.x + this.y * this.y;
    }
  }, {
    key: "distanceTo",
    value: function distanceTo(v) {
      return this.sub(v).len();
    }
  }, {
    key: "dot",
    value: function dot(v) {
      return this.x * v.x + this.y * v.y;
    }
  }, {
    key: "project",
    value: function project(v) {
      return this.scale(v.dot(this) / this.len2());
    }
  }, {
    key: "copy",
    value: function copy() {
      return new Vector(this.x, this.y);
    }
  }], [{
    key: "V",
    value: function V(x, y) {
      return new Vector(x, y);
    }
  }]);

  return Vector;
}();

module.exports = Vector;

},{}],22:[function(require,module,exports){
"use strict";

var V = require("../math/Vector").V;

var Renderer = require("./Renderer");

var Camera = require("../Camera");

var GRID_SIZE = 50;

var Grid = function () {
  return {
    render: function render(renderer, camera) {
      var step = GRID_SIZE / camera.zoom;
      var cpos = V(camera.pos.x / camera.zoom - renderer.canvas.width / 2, camera.pos.y / camera.zoom - renderer.canvas.height / 2);
      var cpx = cpos.x - Math.floor(cpos.x / step) * step;
      if (cpx < 0) cpx += step;
      var cpy = cpos.y - Math.floor(cpos.y / step) * step;
      if (cpy < 0) cpy += step; // Batch-render the lines = uglier code + way better performance

      renderer.save();
      renderer.setStyles(undefined, '#999', 1 / camera.zoom);
      renderer.context.beginPath();

      for (var x = -cpx; x <= renderer.canvas.width - cpx + step; x += step) {
        renderer._line(x, 0, x, renderer.canvas.height);
      }

      for (var y = -cpy; y <= renderer.canvas.height - cpy + step; y += step) {
        renderer._line(0, y, renderer.canvas.width, y);
      }

      renderer.context.closePath();
      renderer.context.stroke();
      renderer.restore();
    }
  };
}();

module.exports = Grid;

},{"../Camera":15,"../math/Vector":21,"./Renderer":23}],23:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Vector = require("../math/Vector");

var V = Vector.V;

var Transform = require("../math/Transform");

var Browser = require("../Browser");

var Camera = require("../Camera");

var Renderer =
/*#__PURE__*/
function () {
  function Renderer(canvas) {
    var vw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;
    var vh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.0;

    _classCallCheck(this, Renderer);

    this.canvas = canvas;
    this.tintCanvas = document.createElement("canvas");
    this.vw = vw;
    this.vh = vh;
    this.context = this.canvas.getContext("2d");
    this.tintCanvas.width = 100;
    this.tintCanvas.height = 100;
    this.tintContext = this.tintCanvas.getContext("2d");
  }

  _createClass(Renderer, [{
    key: "setCursor",
    value: function setCursor(cursor) {
      this.canvas.style.cursor = cursor;
    }
  }, {
    key: "resize",
    value: function resize() {
      this.canvas.width = window.innerWidth * this.vw;
      this.canvas.height = window.innerHeight * this.vh;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }, {
    key: "save",
    value: function save() {
      this.context.save();
    }
  }, {
    key: "restore",
    value: function restore() {
      this.context.restore();
    }
  }, {
    key: "transform",
    value: function transform(camera, _transform) {
      var m = _transform.getMatrix().copy();

      var v = camera.getScreenPos(V(m.mat[4], m.mat[5]));
      m.mat[4] = v.x, m.mat[5] = v.y;
      m.scale(V(1 / camera.zoom, 1 / camera.zoom));
      this.context.setTransform(m.mat[0], m.mat[1], m.mat[2], m.mat[3], m.mat[4], m.mat[5]);
    }
  }, {
    key: "translate",
    value: function translate(v) {
      this.context.translate(v.x, v.y);
    }
  }, {
    key: "scale",
    value: function scale(s) {
      this.context.scale(s.x, s.y);
    }
  }, {
    key: "rotate",
    value: function rotate(a) {
      this.context.rotate(a);
    }
  }, {
    key: "rect",
    value: function rect(x, y, w, h, fillStyle, borderStyle, borderSize, alpha) {
      this.save();
      this.setStyles(fillStyle, borderStyle, borderSize, alpha);
      this.context.beginPath();
      this.context.rect(x - w / 2, y - h / 2, w, h);
      this.context.fill();
      if (borderSize > 0 || borderSize == undefined) this.context.stroke();
      this.context.closePath();
      this.restore();
    }
  }, {
    key: "circle",
    value: function circle(x, y, r, fillStyle, borderStyle, borderSize, alpha) {
      this.save();
      this.setStyles(fillStyle, borderStyle, borderSize, alpha);
      this.context.beginPath();
      this.context.arc(x, y, r, 0, 2 * Math.PI);
      if (fillStyle != undefined) this.context.fill();
      if (borderSize > 0 || borderSize == undefined) this.context.stroke();
      this.context.closePath();
      this.restore();
    }
  }, {
    key: "image",
    value: function image(img, x, y, w, h, tint) {
      this.context.drawImage(img, x - w / 2, y - h / 2, w, h);
      if (tint != undefined) this.tintImage(img, x, y, w, h, tint);
    }
  }, {
    key: "tintImage",
    value: function tintImage(img, x, y, w, h, tint) {
      this.tintContext.clearRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
      this.tintContext.fillStyle = tint;
      this.tintContext.fillRect(0, 0, this.tintCanvas.width, this.tintCanvas.height);
      if (Browser.name !== "Firefox") this.tintContext.globalCompositeOperation = "destination-atop";else this.tintContext.globalCompositeOperation = "source-atop";
      this.tintContext.drawImage(img, 0, 0, this.tintCanvas.width, this.tintCanvas.height);
      this.context.globalAlpha = 0.5;
      this.context.drawImage(this.tintCanvas, x - w / 2, y - h / 2, w, h);
      this.context.globalAlpha = 1.0;
    }
  }, {
    key: "text",
    value: function text(txt, x, y, w, h, textAlign) {
      this.save();
      this.context.font = "lighter 15px arial";
      this.context.fillStyle = '#000';
      this.context.textAlign = textAlign;
      this.context.textBaseline = "middle";
      this.context.fillText(txt, x, y);
      this.restore();
    }
  }, {
    key: "getTextWidth",
    value: function getTextWidth(txt) {
      var width = 0;
      this.save();
      this.context.font = "lighter 15px arial";
      this.context.fillStyle = '#000';
      this.context.textBaseline = "middle";
      width = this.context.measureText(txt).width;
      this.restore();
      return width;
    }
  }, {
    key: "line",
    value: function line(x1, y1, x2, y2, style, size) {
      this.save();
      this.setStyles(undefined, style, size);
      this.context.beginPath();
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.stroke();
      this.context.closePath();
      this.restore();
    }
  }, {
    key: "_line",
    value: function _line(x1, y1, x2, y2) {
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
    }
  }, {
    key: "curve",
    value: function curve(x1, y1, x2, y2, cx1, cy1, cx2, cy2, style, size) {
      this.save();
      this.setStyles(undefined, style, size);
      this.context.beginPath();
      this.context.moveTo(x1, y1);
      this.context.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      this.context.stroke();
      this.context.closePath();
      this.restore();
    }
  }, {
    key: "quadCurve",
    value: function quadCurve(x1, y1, x2, y2, cx, cy, style, size) {
      this.save();
      this.setStyles(undefined, style, size);
      this.context.beginPath();
      this.context.moveTo(x1, y1);
      this.context.quadraticCurveTo(cx, cy, x2, y2);
      this.context.stroke();
      this.context.closePath();
      this.restore();
    }
  }, {
    key: "shape",
    value: function shape(points, fillStyle, borderStyle, borderSize) {
      this.save();
      this.setStyles(fillStyle, borderStyle, borderSize);
      this.context.beginPath();
      this.context.moveTo(points[0].x, points[0].y);

      for (var i = 1; i < points.length; i++) {
        this.context.lineTo(points[i].x, points[i].y);
      }

      this.context.lineTo(points[0].x, points[0].y);
      this.context.fill();
      this.context.closePath();
      if (borderSize > 0) this.context.stroke();
      this.restore();
    }
  }, {
    key: "setStyles",
    value: function setStyles() {
      var fillStyle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '#ffffff';
      var borderStyle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#000000';
      var borderSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      var alpha = arguments.length > 3 ? arguments[3] : undefined;
      if (alpha != undefined && alpha !== this.context.globalAlpha) this.context.globalAlpha = alpha;
      if (fillStyle !== this.context.fillStyle) this.context.fillStyle = fillStyle;
      if (borderStyle !== this.context.strokeStyle) this.context.strokeStyle = borderStyle;
      if (borderSize !== this.context.lineWidth) this.context.lineWidth = borderSize;
    }
  }]);

  return Renderer;
}();

module.exports = Renderer;

},{"../Browser":14,"../Camera":15,"../math/Transform":20,"../math/Vector":21}],24:[function(require,module,exports){
"use strict";

var V = require("../../math/Vector").V;

var Renderer = require("../Renderer");

var IOPortRenderer = require("./IOPortRenderer");

var Camera = require("../../Camera");

var Component = require("../../../models/ioobjects/Component");

var Images = require("../../Images"); // var ANDGate = require("../../../models/ioobjects/gates/ANDGate");
// var Switch = require("../../../models/ioobjects/inputs/Switch");
// var LED = require("../../../models/ioobjects/outputs/LED");


var ComponentRenderer = function () {
  var images = [];
  return {
    render: function render(renderer, camera, object, selected) {
      renderer.save();
      var transform = object.getTransform();
      renderer.transform(camera, transform);

      for (var i = 0; i < object.getInputCount(); i++) {
        IOPortRenderer.renderIPort(renderer, camera, object.getInput(i), selected);
      }

      for (var i = 0; i < object.getOutputCount(); i++) {
        IOPortRenderer.renderOPort(renderer, camera, object.getOutput(i), selected);
      } // if (this.isPressable && this.selectionBoxTransform != undefined)
      //     renderer.rect(0, 0, this.selectionBoxTransform.size.x, this.selectionBoxTransform.size.y, this.getCol(), this.getBorderColor());


      renderer.image(Images.GetImage(object.getImageName()), 0, 0, transform.size.x, transform.size.y);
      renderer.restore();
    }
  };
}();

module.exports = ComponentRenderer;

},{"../../../models/ioobjects/Component":5,"../../Camera":15,"../../Images":17,"../../math/Vector":21,"../Renderer":23,"./IOPortRenderer":25}],25:[function(require,module,exports){
"use strict";

var DEFAULT_FILL_COLOR = require("../../Constants").DEFAULT_FILL_COLOR;

var DEFAULT_BORDER_COLOR = require("../../Constants").DEFAULT_BORDER_COLOR;

var DEFAULT_ON_COLOR = require("../../Constants").DEFAULT_ON_COLOR;

var SELECTED_FILL_COLOR = require("../../Constants").SELECTED_FILL_COLOR;

var SELECTED_BORDER_COLOR = require("../../Constants").SELECTED_BORDER_COLOR;

var IO_PORT_LINE_WIDTH = require("../../Constants").IO_PORT_LINE_WIDTH;

var IO_PORT_RADIUS = require("../../Constants").IO_PORT_RADIUS;

var IO_PORT_BORDER_WIDTH = require("../../Constants").IO_PORT_BORDER_WIDTH;

var V = require("../../math/Vector").V;

var Renderer = require("../Renderer");

var Camera = require("../../Camera");

var InputPort = require("../../../models/ioobjects/InputPort");

var OutputPort = require("../../../models/ioobjects/OutputPort");

var IOPortRenderer = function () {
  return {
    renderIPort: function renderIPort(renderer, camera, iport, selected) {
      var o = iport.getOrigin();
      var v = iport.getTarget();
      var borderCol = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
      renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);
      var circleFillCol = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;
      renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
    },
    renderOPort: function renderOPort(renderer, camera, oport, selected) {
      var o = oport.getOrigin();
      var v = oport.getTarget();
      var borderCol = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
      renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);
      var circleFillCol = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;
      renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
    }
  };
}();

module.exports = IOPortRenderer;

},{"../../../models/ioobjects/InputPort":8,"../../../models/ioobjects/OutputPort":9,"../../Camera":15,"../../Constants":16,"../../math/Vector":21,"../Renderer":23}],26:[function(require,module,exports){
"use strict";

var V = require("../../math/Vector").V;

var Renderer = require("../Renderer");

var Camera = require("../../Camera");

var Wire = require("../../../models/ioobjects/Wire");

var WireRenderer = function () {
  return {
    render: function render(renderer, camera, wire, selected) {}
  };
}();

module.exports = WireRenderer;

},{"../../../models/ioobjects/Wire":10,"../../Camera":15,"../../math/Vector":21,"../Renderer":23}],27:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Camera = require("../utils/Camera");

var Renderer = require("../utils/rendering/Renderer");

var Grid = require("../utils/rendering/Grid");

var WireRenderer = require("../utils/rendering/ioobjects/WireRenderer");

var ComponentRenderer = require("../utils/rendering/ioobjects/ComponentRenderer");

var CircuitDesigner = require("../models/CircuitDesigner");

var IOObject = require("../models/ioobjects/IOObject");

var Wire = require("../models/ioobjects/Wire");

var Component = require("../models/ioobjects/Component");

var MainDesignerView =
/*#__PURE__*/
function () {
  function MainDesignerView() {
    var _this = this;

    _classCallCheck(this, MainDesignerView);

    var canvas = document.getElementById("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas element not found!");
    this.canvas = canvas;
    this.renderer = new Renderer(this.canvas);
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    window.addEventListener('resize', function (e) {
      return _this.resize();
    }, false);
    this.resize();
  }

  _createClass(MainDesignerView, [{
    key: "render",
    value: function render(designer, selections) {
      this.renderer.clear();
      Grid.render(this.renderer, this.camera);
      var wires = designer.getWires();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = wires[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var wire = _step.value;
          var selected = selections.includes(wire);
          WireRenderer.render(this.renderer, this.camera, wire, selected);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var objects = designer.getObjects();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = objects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;
          var selected = selections.includes(object);
          ComponentRenderer.render(this.renderer, this.camera, object, selected);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: "resize",
    value: function resize() {
      this.renderer.resize();
      this.camera.resize(this.canvas.width, this.canvas.height);
    }
  }]);

  return MainDesignerView;
}();

module.exports = MainDesignerView;

},{"../models/CircuitDesigner":3,"../models/ioobjects/Component":5,"../models/ioobjects/IOObject":7,"../models/ioobjects/Wire":10,"../utils/Camera":15,"../utils/rendering/Grid":22,"../utils/rendering/Renderer":23,"../utils/rendering/ioobjects/ComponentRenderer":24,"../utils/rendering/ioobjects/WireRenderer":26}]},{},[1])

//# sourceMappingURL=Bundle.js.map
