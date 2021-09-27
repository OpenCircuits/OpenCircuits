---
title: Fall 2019 Research
---

### [Presentation slides](https://docs.google.com/presentation/d/19Gi6qvdddrxKpm5C6mPzxLQkS1loJMsnq5jjXHL4LS0)


<img src="/img/analog_logo.svg" width="800" style={{margin: "40px 0px"}} />


### Fall 2019


## Team:

* [Rylan Gupta (Project Manager)](https://github.com/Rylander77)
* [Jonathan](https://github.com/Schmaj)
* [Christopher](https://github.com/jumpingkangaroo)
* [Delaney](https://github.com/delaneyaqua)
* [Vincent](https://github.com/vincenthuang)


## Project Goals:
* Add analog componentry and functionality to OpenCircuits
* Add analog circuit analysis methods and tools 
* Incorporate interoperability between digital and analog components across both projects


## Semester Goals
* Build off the work and research done during last semester (Spring 2019) 
* Research and assess different approaches to circuit analysis techniques and solutions
* Develop plan to implement aforementioned solutions and / or utilize libraries to achieve the same goal


## Different Approaches to Circuit Analysis

While these items are not necessarily mutually exclusive, here are different approaches that the team considered:

* Building our own framework and algorithms - starting with nodal analysis for DC steady state circuits with resistors. Go on to support for AC circuits with RMS analysis, and capacitors and inductors. Ideally, each framework is build to support the future stages of development. However, improvements could take a lot of refactoring, which is a trait the OpenCircuits project already suffers from.
* Server side analysis - using API calls fromthe browser to send circuit schematics to an analysis server, this would make implementation for the client very trivial, and would allow us to use existing tools, such as SPICE, for circuit simulation running locally on the server. However, this approach is not ideal, as we would like to have the entire project contained to a web browser client without the need for server - client communication outside of GCP.
* Open Source library / framework - Implementing an existing open source project into OpenCircuits EE could turn such an immensly challenging task into a task manageable for the likes of RCOS. With a framework / library / project with a simple enough API, OpenCircuits EE could utilize said library to do the underlying analysis. This would be ideal, given the scope of RCOS projects and goals that are achievable on a semester to semester basis.
* SPICE implementation - SPICE is a standard framework for circuit analysis, used in many applications such as PSpice, LTSpice, NGSpice, amongst others. SPICE is used widely in educational settings for electrical engineering, and SPICE analysis has been around since 1973.


## Spice Algorithm Research

While researching our own SPICE algorithm implementation, the following sources were used to get a sense of what our own implementation of SPICE would entail:

Rashid, Muhammad H.. SPICE for Power Electronics and Electric Power. CRC Press, 2017.

“SPICE Algorithm Overview.” SPICE Algorithm Overview, ECircuit Center, 2003, www.ecircuitcenter.com/SpiceTopics/Overview/Overview.htm.

Tuinenga, Paul W. Spice - a Guide to Circuit Simulation and Analysis Using PSpice. Simon &amp; Schuster, 1995.

Department of Electrical and Electronic Engineering of Imperial College London - EE 2.3: Semiconductor Modelling in SPICE Lecture: https://www.imperial.ac.uk/pls/portallive/docs/1/7292571.PDF 


## Libraries & Projects Considered

When considering projects, the following attributes were considered when researching each project:

- [ ] Language
- [ ] Documentation
- [ ] API support
- [ ] License
- [ ] SPICE 

### Circuit Sandbox

Source: https://github.com/willymcallister/circuit-sandbox 

Demo: https://spinningnumbers.org/circuit-sandbox/index.html 

- [X] Language: Javascript
- [ ] Documentation
- [ ] API support
- [X] License - MIT License
- [ ] SPICE 

The entirety of this projects analysis and component models are in [one 6912 line long .js file](https://github.com/willymcallister/circuit-sandbox/blob/master/js/schematic.js), making this a difficult project to easily understand and use. The project would be better off using a more organizaed project.


### Maxwell

Source: https://github.com/Aerlinger/maxwell 

Demo: http://circuitlab.herokuapp.com/

- [X] Language: Javascript
- [ ] Documentation
- [X] API support
- [X] License - MIT License
- [ ] SPICE 

Maxwell has a much better layout and organization than Circuit Sandbox. Additionally, the project has a real-time graphing logger, and many example circuits. While there is also some API functionality, the project shows signs of incompleteness, such as lingering TODO's and commented out code with no new commits in over 2 years. Ultimately, a more complete and perhaps actively developed library would be a better fit for OpenCircuits EE.


### circuitjs1

Source: https://github.com/pfalstad/circuitjs1 

Demo: http://www.falstad.com/circuit/

- [X] Language: Java, runs in [GWT](http://www.gwtproject.org/overview.html)
- [ ] Documentation
- [ ] API support
- [X] License - GNU GPL License
- [ ] SPICE 

Circuitjs1 also has a real-time graphing logger, and many example circuits. This project also has unique features, such as an audio output for signals, as well as simulation and current speed control. However, there is no API documentation.


### NGSpice

Source: https://sourceforge.net/projects/ngspice/ 

- [ ] Language: C
- [X] Documentation
- [X] API support
- [X] License - New BSD license
- [X] SPICE 

With a JavaScript wrapper for the C code, such as a GWT type project, node module, or WebAssembly, we could use the NGSpice C code in our project in the browser. NGSpice is widely used in many applications today, and is actively developed. There is also a lot of documentation for using the project as an API. 


### Conclusion from libray and project research

While a greater challenge than using an existing open source library written in JavaScript, the team decided that SPICE analysis. The following section details how we could use NGSpice in OpenCircuits EE moving forward.



# NGSpice Research

## NGSpice Summary
NGSpice is a popular open source circuit simulation library. It is written in C, and is used as the back-end for multiple popular commercial circuit simulators and design tools. NGSpice uses a modified BSD license that permits us to use it. It is very well documented, with a comprehensive manual that was updated as recently as September. The main section in this manual that will be relevant to us is the section on its use as a shared library.

## NGSpice as Shared Library
If we used NGSpice as a library, we would have a C wrapper that would take in the netlist of the circuit from our typescript code, translate this netlist into the structs that NGSpice uses, and  translate the output back into something that could be returned to our typescript code. Here, we are going to briefly go over some aspects of using NGSPice as a shared library, including the structs it uses, the netlist format, and the functions that would be called by our wrapper. 

#### Netlist Format
The basic netlist we would pass to NGSpice is an array of strings (char** in C). The first line in the netlist is the of the circuit. An example of this is ".TITLE Simple Resistor Circuit". The last line of the netlist is just ".end". The rest of the lines of the netlist are each a component of the circuit. In each line is an element name, the nodes its connected to, and any parameter values. 

The first part of the line is the element name. The first letter of the element name specifies the type of component, while the rest make up the unique identifier of the component. For example, a resistor could be R1, ROUT, Rin, etc.

The second part of the line are the nodes the elements are connected to. A node name is an arbitrary string, case insensitive, that does not start with a number. There must be one string that is named "0" that is used as the ground node. For most "classic" analog components, two nodes are specified.

The third part of the line is the parameter value. This is used to specify the resistance, capacitance, etc. SI prefixes can be used to specify sizes. For example, 1M is converted to 1,000,000 and 1u is converted to 0.000001. 

Below is a brief list of the components that will likely be useful for a simple analog simulation implementation. There are other types of components that we could also implement, however they require more specific models to simulate different type of that component. For example, for a BJT transisitor, there are different models for BJTs made by different manufacturers. They have different characteristics that makes them behave differently when being simulated. 

| Code  |   Model Type   |
| :---: | :------------: |
|   I   | Current Source |
|   V   | Voltage Source |
|   R   |    Resistor    |
|   C   |   Capacitor    |
|   L   |    Inductor    |

### Simulation Commands
There are seven types of analysis in NGSpice, however we likely will only need to use three of them (at least at first). The simulation types we will likely want to support are DC Analysis, AC Small-Signal Analysis, and Transient Analysis.

DC Analysis is used to get the DC Operating Point and to perform a DC Sweep of a system. For DC Analysis, all time dependent components (such as capacitors and inductors) are taken as time -> infinity. This opens capacitors and closes inductors. The SPICE than solves the circuit with the time independent components. A DC Sweep is the same thing, however this is performed across a range of DC values to find the response at different DC levels. 

AC Small-Signal Analysis is sued to determine the frequency response over a given range of frequencies. This depends on the time dependent components. The main output for this kind of simulation is a transfer function of gain across the given range of frequencies. 

Transient Analysis is used to calculate the output of the circuit as a function of time. For example, we could make a simple RC circuit and then see how long it takes the capacitor to charge.

### Struct Formats
In order to allow use of its shared library, NGSpice defines certain structs that it used to transfer data into and out of a simulation. This is a brief overview of some of the structs used.

The vector_info struct is a basic data carrying structure to return the data when the client calls the ngGet_Vec_Info function on a given vector name. It contains the real, complex, and length along with the basic name data. 

Two struct types that are often used together are vecinfo and vecinfoall. vecinfoall is used to return the data from a plotting call. It contains some basic information about the plots, as well as an array of vecinfo that contain the data in the plot. Each vecinfo struct contains some basic information about the vector, as well as a pointer to the actual vector that contains the data.

The last two structs are similar in relationship to the vecinfo and vecinfoall ones above. vecvaluesll contains some basic information about itself, as well as an array of vecvalues. Each vecvalue contains a name, a real value, an imaginary value, as well as some other basic information. They are used to return new data points of an already existing plot.

These strucures will be used by our wrapper to communicate with the actual library. That wrapper will need to translate these structs into formats that we could then return to the typescript application. 

### Shared Library Functions
What follows is a brief overview of some of the different functions that would be used in our wrapper to implement the NGSpice shared library. They extensively use callback functions, so our implementation will need to provide update and notification functions that we can pass as callback functions, in order to respond to completed simulations, send output, and read errors. 

ngSpice_Init is the function that initializes the simulator. This function also takes as parameters mulitple callback functions in order to process output. ngSpice_Circ is used to input the netlist. It takes as input a char** that describes the circuit line by line. ngSpice_Command is used to add components and start a simulation. ngSpice_AllPlots returns an array of the plots that were generated.

Below, you can see a basic diagram of what the implementation would look like. 
![NGSpice Implementation Diagram](https://i.imgur.com/VoRhG9C.png)

## node-gyp
node-gyp is one potential way we could implement the NGSPice library and our wrapper class in the browser. It uses a fork of the GYP library, and it can be used to compile Node.js native addons. Ideally, this would allow us to run our wrapper code and the NGSpice library in the browser. There are some potential issues here, such as using it with a large and complex library such as NGSpice. However it is definitely a potential solution that is worth looking at in more detail. 