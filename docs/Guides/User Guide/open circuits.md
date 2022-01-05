

<center><img src="logo.svg" alt="logo" style="zoom:150%;" /></center>

<center> <h2>User Guide</h2> </center>

​		Playing with different electronic components and creating your own circuits online! If you have a question or would like to recommend a feature, please reach out to [contact@opencircuits.io](mailto:contact@opencircuits.io).

<center> <h2>Getting Started with Open Circuits</h2> </center>

​		Welcome to Open Circuits. Let's first get familar with the user interface.

 <img src="help.svg" alt="help" style="zoom:150%;" /> Help center for more resources                        <img src="download.svg" alt="download" style="zoom:150%;" />  Download circuits in *.circuit, *.pdf, or *png file.

 <img src="open.svg" alt="open" style="zoom:150%;" /> Import *.circuit files from computer               <img src="signin.png" alt="signin" style="zoom: 6%;" /> Sign in using google account.

 <img src="save.png" alt="save" style="zoom:3.3%;" /> Save your circuit after you sign in                 <img src="lock_open.svg" alt="lock_open" style="zoom:150%;" /> Edit mode                        <img src="lock.svg" alt="lock" style="zoom:150%;" /> Lock mode

  <img src="tab.png" alt="tab" style="zoom: 5%;" />   Manage circuits and view examples.   	         <img src="github.png" alt="github" style="zoom:10%;" />  Github link      			    <img src="add.png" alt="add" style="zoom:7.5%;" />  Add components

​		Great! Let's get to know our first circuit! Clicking the <img src="tab.png" alt="tab" style="zoom:5%;" /> button and then the Basic AND Gate Setup to load the example circuit. If it's not shown, refresh the page and try again.  

<center> <h5>Example Circuit</h5> </center>																											 					

<img src="circuit.png" alt="circuit" style="zoom:25%;" align="left"/><img src="edit_circuit.png" alt="edit_circuit" style="zoom:33%;" align="right"/>

​		









​		**Basic**: This example contains two switches<img src="switch.png" alt="switch" style="zoom:5%;" />, one AND Gate <img src="andgate.png" alt="andgate" style="zoom:5%;" />, and one LED <img src="led.png" alt="led" style="zoom:5%;" />. Switch, aside from its original function, also represents signal. AND Gate passes the signal only if all switches are on, that means all inputs are true. Currently, there're two. Turn up both of them to light up the LED.
​		**How to edit**: That's lit! Click the AND Gate <img src="andgate.png" alt="andgate" style="zoom:5%;" /> and it will show a list of parameters. Below it's a table for the all parameters we support currently. Change whichever you want.

| Pararmeter  |                       Description                       |
| :---------: | :-----------------------------------------------------: |
|    Name     |          Name of the component, including wire          |
|  Position   |                Position of the component                |
| Input count | Maximum input count are varied by different components. |
|    Color    |                    Color of the LED                     |
|  Create IC  |      Creating an integrated circuit in the scene.       |
| Clock Delay |       How often the Clock turn on/off the signal.       |

<img src="edit_circuit2.png" alt="edit_circuit2" style="zoom:20%;" align="left"><img src="download_combine.png" alt="download_combine" style="zoom:20%;" align="right"/>		

​







​		**Add components**: I change input count to three and color to pink. Notice there's one more button here. How? You could just click the add icon  <img src="add.png" alt="add" style="zoom:6%;" /> , drag the switch icon<img src="switch.png" alt="switch" style="zoom:5%;" /> tdowo the circuit, and connect it to the new input of the AND Gate <img src="andgate.png" alt="andgate" style="zoom:5%;" />.
​		**Save the circuit locally**: Clicking the<img src="download.svg" alt="download" style="zoom:150%;" />button. You will see three options:
​	  <img src="download.svg" alt="download" style="zoom:150%;" />Download: save as [name].circuit file. Notice that this is the only supported file for import.
​	   <img src="pdf_download.svg" alt="pdf_download" style="zoom:120%;" /> Download as PDF				      		  ![png_download](png_download.svg) Download as PNG

​		**Save the circuit online**: Clicking the <img src="signin.png" alt="signin" style="zoom: 6%;" /> button and sign in with your google account and then the <img src="save.png" alt="save" style="zoom:3.3%;" /> button to save the circuit online. You could always remove it from the cloud by clicking the <img src="tab.png" alt="tab" style="zoom: 5%;" /> and ![close-24px](close-24px.svg)buttons under "My Circuits" section.

<center> <h2>Supported Components</h2> </center>

<center> <h5>Inputs</h5> </center>

<img src="constantlow.png" alt="constantlow" style="zoom:15%;" />**Constant Low**: signal that is constantly off.<img src="constanthigh.png" alt="constanthigh" style="zoom:15%;" />**Constant High**: signal that is constantly on.

<img src="button.png" alt="button" style="zoom:15%;" />**Button**: Left click to enable signal one time.<img src="switch.png" alt="switch" style="zoom:15%;" />**Switch**: Left click to switch on/off signal .

<img src="clock.png" alt="clock" style="zoom:15%;" />**Clock**: Auto-switch on/off signal regularly by setting the clock delay.

<center> <h5>Outputs</h5> </center>

<img src="led.png" alt="led" style="zoom:15%;" />**LED**: Light up if it connects to the signal.    <img src="sevensegmentdisplay.png" alt="sevensegmentdisplay" style="zoom:15%;" />**Segment Display**: Display digits.

<center> <h5>Logic Gates</h5> </center>

<img src="bufgate.png" alt="bufgate" style="zoom:15%;" />**Buffer Gate**: It passes its input, unchanged, to its output.

<img src="notgate.png" alt="notgate" style="zoom:15%;" />**NOT Gate**: It produces an inverted version of the input at its output.

<img src="andgate.png" alt="andgate" style="zoom:15%;" />**AND Gate**: It implements logical conjunction (∧) from mathematical logic.

<img src="nandgate.png" alt="nandgate" style="zoom:15%;" />**NAND Gate**: It produces an output which is false only if all its inputs are true.

<img src="orgate.png" alt="orgate" style="zoom:15%;" />**OR Gate**: It implements logical disjunction (∨) from mathematical logic.

<img src="norgate.png" alt="norgate" style="zoom:15%;" />**NOR Gate**: It gives a positive output only when both inputs are negative.

<img src="xorgate.png" alt="xorgate" style="zoom:15%;" />**XOR Gate**: It gives a true output when the number of true inputs is odd.

<img src="xnorgate.png" alt="xnorgate" style="zoom:15%;" />**XNOR Gate**: It gives true when all of its inputs are true or when all of its inputs are false

<center> <h5>Flip Flops</h5> </center>

<img src="srflipflop.png" alt="srflipflop" style="zoom:15%;" /> **SR Flip Flops**: a 1-bit memory bistable device having two inputs.

<img src="jkflipflop.png" alt="jkflipflop" style="zoom:15%;" /> **JK Flip Flops**: it has the input- following character of the clocked D flip-flop but has two inputs.

<img src="dflipflop.png" alt="dflipflop" style="zoom:15%;" /> **D Flip Flops**:  delay the change of state of its output signal.

<img src="tflipflop.png" alt="tflipflop" style="zoom:15%;" /> **T Flip Flops**:  is toggled when the set and reset inputs alternatively changed by the trigger.

<center> <h5>Latches</h5> </center>

<img src="dlatch.png" alt="dlatch" style="zoom:15%;" /> **D Latches**: capture the logic level which is present on the Data line when the clock input is high.

<img src="srlatch.png" alt="srlatch" style="zoom:15%;" /> **SR Latches**: a special type of asynchronous device which works separately for control signals.

<center> <h5>Other</h5> </center>

<img src="multiplexer.png" alt="multiplexer" style="zoom:15%;" />**Multiplexer(Mux)**: It's a device that can receive multiple input signals and synthesize a single output signal in a recoverable manner for each input signal.

<img src="demultiplexer.png" alt="demultiplexer" style="zoom:15%;" />**Demultiplexer(Demux)**: It takes one single input data line and then switches it to any one of a number of individual output lines one at a time.

<img src="encoder.png" alt="encoder" style="zoom:15%;" />**Encoder**: It converts the active data signal into a coded message format or it is a device that coverts analogue signal to digital signals

<img src="decoder.png" alt="decoder" style="zoom:15%;" />**Decoder**: It's a combinational circuit as encoder but its operation is exactly reverse as that of the encoder

<img src="label.png" alt="label" style="zoom:15%;" />**Label**: a text box that allows you to write any text inside.

<center> <h2>Keyboard Shortcuts</h2> </center>

**Undo**: ctrl + z		**Redo**: ctrl + y		**Copy**: ctrl + c		**Paste**: ctrl + v		**Cut**: ctrl + x
**Select**: left click the component		 **Multiple select**: hold left click
**Delete a component**: Press “delete”								 **Zoom in/out**: scroll the middle wheel

<center> </center>
<center> </center>
<center> </center>
<center> </center>
<center> </center>
<center> </center>
