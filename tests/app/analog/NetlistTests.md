Testing for generated netlists is tough, as there may be several valid netlists for a given circuit. This file describes the test cases used to test the functionality of the netlist generation.  

To quickly visualize a generated netlist as a diagram, [NetlistViewer](https://sourceforge.net/projects/netlistviewer/) gets the job done. However, it requires a couple extra lines in the netlist. The code to generate these extra lines is commented out by default. To uncomment them for ease of testing, they can be found in the stringifyNetList() function of app/analog/ts/models/AnalogCircuitDesigner.ts  

# Test cases
The following is a set of links to images hosted on imgur, showing the circuits that have been tested. These are followed be an example of a possible valid netlist. If there is a better method of representing these test cases, please feel free to replace the imgur links with that representation.  
Note that order of components does not matter, nor does the naming conventions of these components.

### [Standard uses with the battery, resistor, and capacitor](https://imgur.com/a/zOw51KK)
RC time-constant circuit - standalone ports

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 2 0 3.3k
    c1 2 1 47u ic=0
    c2 2 1 22u ic=0
    .end

RC time-constant circuit - no standalone ports

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 2 0 3.3k
    c1 2 1 47u ic=0
    c2 2 1 22u ic=0
    .end

Multiple-source DC resistor network circuit

    OpenCircuits Outputted Netlist
    v1 3 0 dc 24
    v2 1 0 dc 15
    r1 2 3 10k
    r2 1 2 8.1k
    r3 0 2 4.7k
    .end

Simple series circuit

    OpenCircuits Outputted Netlist
    r1 2 1 5k
    r2 3 2 5k
    r3 3 0 5k
    v1 1 0 dc 10
    .end

Simple parallel circuit - standalone ports

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 0 1 5k
    r2 0 1 10k
    .end

Simple parallel circuit - no standalone ports

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 0 1 5k
    r2 0 1 10k
    .end

### [Ground component tests](https://imgur.com/a/ANqinAi)
The addition of a ground component does not fundamentally change how a netlist is formatted, as a netlist interpreter always assumes node 0 is the ground. i.e. the ground component is not explicitly defined in a netlist.  

There are also tests using multiple grounds. Note that all grounds must be on the same wire, i.e. node of a netlist. This is a rule for circuit building as a whole. Having grounds on entirely separate parts of circuit causes undefined behavior for netlists regardless.

Simple series circuit

    OpenCircuits Outputted Netlist
    r1 2 1 5k
    r2 3 2 5k
    r3 3 0 5k
    v1 1 0 dc 10
    .end

Simple parallel circuit - standalone ports

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 0 1 5k
    r2 0 1 10k
    .end

Simple parallel circuit - no standalone ports

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 0 1 5k
    r2 0 1 10k
    .end

Simple parallel circuit - standalone ports, multiple grounds

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 0 1 5k
    r2 0 1 10k
    .end

Simple parallel circuit - no standalone ports, multiple grounds

    OpenCircuits Outputted Netlist
    v1 1 0 dc 10
    r1 0 1 5k
    r2 0 1 10k
    .end
