---
title: Using NGSpice
---

## Team
* Evan Cama
* Andrew Barton
* Robert Hammond
## Resources
[NGSpice user manual](http://ngspice.sourceforge.net/docs/ngspice-manual.pdf)  
Important chapters: 19, 32

[NGSpice Shared Library](http://ngspice.sourceforge.net/shared.html)  
This contains a large number of links to numerous uses of the NGSpice library.  
The ones we are currently interested in are the C Language console applications. Clicking [this sourceforge link](http://ngspice.sourceforge.net/ngspice-shared-lib/ngspice_cb.7z) will automatically download these applications for you.  
You will also need the ngspice.dll file. [This](http://ngspice.sourceforge.net/ngspice-shared-lib/ngspice-sh_bin_win32.7z) is the sourceforge link for the 32-bit version, while [this](http://ngspice.sourceforge.net/ngspice-shared-lib/ng_start64_binaries.7z) is the sourceforge link for the 64-bit version.  

The ngspice_cb directory contains 2 methods of linking to the NGSpice library. Either you can link to the library dynamically during runtime, or you can link to it statically during compilation. For our methods, we will likely do the latter. This directory also contains convenient folders with Visual Studio project files, making it much easier to traverse these examples.

## Compiling with Linux
[Compiling NGSpice, according to the manual](http://ngspice.sourceforge.net/docs/ngspice-manual.pdf#chapter.32)  
The manual gives a (probably) good explanation on how to compile NGSpice. For now, we are testing everything on 64-bit Linux. Instructions for other operating systems will be added in the future. What follows is just a set of additional notes when following along in the manual.  

- In general, required packages can automatically be installed in the terminal with `sudo apt install packageName`  
- Packages to install: ngspice, bison, flex, libx11-6, libx11-dev, libxaw7, libxaw7-dev, libfftw3-3, libreadline8, libreadline-dev, and gcc-multilib. If installing from git, also install autoconf, automake, and libtool.
- Link to the specific tarball folder [here](https://sourceforge.net/projects/ngspice/files/ng-spice-rework/32/ngspice-32.tar.gz/download). We may want to go through the tarball installation instead of using the Git, as the Git is still under development and may be unstable. The tarball is the official released distribution.
- When installing for a tarball, the manual gives a ./configure command to run. In addition to the flags listed, also include the flag --with-ngshared. This will actually create the shared library that we will need to use later. The command should look like `./configure --enable-xspice --disable-debug --with-readline=yes --with-ngshared`
- When running that ./configure command, you may get an error at the end of runtime that reads "configure: error: Couldn't find GNU readline headers." If this is the case, your system itself is missing the readline.h header. You may need the lib64readline-dev package.

Section 32.2.1 of the user manual explains building ngspice with MS Visual Studio.

[Where the package files are]
After you run `sudo make install`, the package's files will be installed in `/usr/local/bin`, `/usr/local/man`, `/usr/local/lib`, `/usr/local/share`, and `/usr/local/include`. The shared object file(s) `libngspice.so` is located in `/usr/local/lib`.  

[Linking the libngspice.so files]  
cd over to the folder /usr/local/lib and run the following commands:  
`file libngspice.so`  
`file libngspice.so.0.0.0`  

[Running the test program]
After installing ngspice, you can compile and run the test program of ngspice_cb. As mentioned in compile-linux-new.txt, you will have to run the following command in the `ngspice_cb` directory:  
`export LD_LIBRARY_PATH=/lib:/usr/lib:/usr/local/lib`  
For static linking of ngspice,  
`cd ng_shared_test_sl`  
`gcc main.c -m32 -Wall -s -lngspice -lpthread -ldl -o ./bin/Debug/ng_sh`  
This may give you a compilation error "unable to find -lngspice". To fix this, add the `-L` flag to the gcc command:  
`gcc main.c -L -m32 -Wall -s -lngspice -lpthread -ldl -o ./bin/Debug/ng_sh`  
Additionally, you may need to cd into ng_shared_test_dl/bin/Debug and run the command `sudo ln -s /usr/local/lib/libngspice.so.0.0.0 /usr/local/lib/libngspicelib.so`

## Compiling with MinGW32 / MSYS2
The shared library can be compiled using the MSYS2 shell in Windows, which can be installed and set up using this [helpful guide](https://github.com/orlp/dev-on-windows/wiki/Installing-GCC--&-MSYS2). 
```
pacman -S gcc libtool autoconf automake bison git make
git clone git://git.code.sf.net/p/ngspice/ngspice
cd ngspice
./compile_min_shared.sh
```
You may get an error: unknown type 'CRITICAL_SECTION', to which the solution is currently unknown.

## Coding with NGSpice
The test program described above is a good example of how to interact with the NGSpice library. The following is an explanation on how it works/how to develop your own code. Much of this information, such as more detailed explanation of the callback functions, can also be found in section 19.3 of the NGSpice manual. 

The first thing you must do is call the function ``ngSpice_Init(SendChar*, SendStat*, ControlledExit*, SendData*, SendInit-Data*, BGThreadRunning*, void)``, which takes in as input several callback functions. These functions, which must be defined and implemented by the user, are called within the NGSpice code. Their purpose to allow the library to send data back up to the user. The int return value is not used.
- ``SendChar(char* outputreturn, int ident, void* userdata)`` is the function that will be called whenever NGSpice wants to print information to the console, i.e. stdout or stderr. This function can be as simple as a single printf statement, such as ``printf("%s\n", outputreturn);``, in addition to any necessary error checking.
- ``SendStat(char* outputreturn, int ident, void* userdata)`` is identical to SendChar, except it's called whenever NGSpice prints raw data to the console. i.e. when it prints "tran: 5.0%" to the console in the test code.
- ``ControlledExit(int exitstatus, bool immediate, bool quitexit, int ident, void* userdata)`` is called whenever NGSpice does a controlled exit, i.e. the "exit" command.
- ``SendData(pvecvaluesall vdata, int numvecs, int ident, void* userdata)`` is called whenever NGSpice changes a single data point during an operation. This allows the user to update any structs that may be stored on their end. This function consequently gets called a lot. Note that NGSpice stores data as a struct. 
- ``SendInit-Data(pvecinfoall intdata, int ident, void* userdata)`` is used to initialize the data vectors that NGSpice will be operating on.
- ``BGThreadRunning(bool noruns, int ident, void* userdata)`` is used by NGSpice to update the user if a background thread is running or not.
- The final input can be the object address of the calling function, i.e. "self" or "this". It's also perfectly fine to use NULL for this value.  

After you call the ngSpice_Init function, it's surprisingly simple to work with the library. Simply call ``ngSpice_Command(char*)`` with a command as the input, and NGSpice handles the rest. It returns '1' upon an error, '0' otherwise. The input would be exactly like what you may put in when running NGSpice in the terminal, such "source ./adder_mos_2.cir", "tran 500p 6400NS", or even "help --all". Note that instead of calling ``ngSpice_Command("run")``, you can call ``ngSpice_Command("bg_run"), which causes NGSpice to run the operation in a background thread. Just make sure not to prematurely shut off the operation. The rest of the functions that can be called are detailed in chapter 19.3 of the manual.

## Creating Netlists
A netlist can be created using any text editor. There are two required lines to be included in a netlist. The first line must be a title line (Note: no special syntax or formatting needed), and the last line of the netlist must be .end. The lines in between can either be comments, control lines, or circuit element lines. The control lines will tell the simulator which model and run parameters to perform. The circuit element lines will add different circuit components to the simulation.  

## NGSpice Commands
There are a wide range of commands that will work with NGSpice once a netlist has been loaded into the program. Once the desired netlist has been created, it must be loaded into NGspice. In order to load a netlist into NGSpice, the user must first be in the correct directory. Terminal commands can be used in NGSpice to get into the right directory (ie. cd &lt;DirectoryName&gt;). Once in the proper directory, in order to load the netlist into NGSpice, use the command: source &lt;filename&gt;. Once the netlist is loaded in properly, then the user will be able type "run" into the command line and results from the netlist will be shown. A good example netlist to look at is the file [voltdiv.sp](https://github.com/OpenCircuits/OpenCircuits/blob/UnitTests/app/analog/ts/Sample%20Netlists/voltdiv.sp). This is a simple voltage divider circuit that will display the vin and vout voltages when run with NGSpice.

Here is a list of some commands that can be run with NGSpice (reference source: [https://esim.fossee.in/ngspicecmd](https://esim.fossee.in/ngspicecmd)):
* help - It opens NGSpice manual and gives information about all NGSpice commands.
* listing - It prints the current netlist of the circuit.
* print v(out) or print v(3) - It prints the voltage values of corresponding node name or node number.
* plot v(out) or plot v(3) - It plots the voltage values of corresponding node name or node number.
* plot v(in1, in2) or print v(2,1) - It plots the voltage difference of two nodes.
* plot v(in1) - v(in2) or print v(2) - v(1) - It plots or prints the voltage difference of two nodes.
* plot v(in1) + v(in2) or print v(2) + v(1) - It plots or prints the voltage addition of two nodes.
* plot v(in1) * v(in2) or print v(2) * v(1) - It plots or prints the voltage multiplication of two nodes.
* plot v(in1) / v(in2) or print v(2) / v(1) - It plots or prints the voltage division of two nodes.
* plot i(vs) or print i(v1)- It prints the current values of corresponding branch. Here we have connect 0v voltage source in series(vs or v1),to find current in particular branch.
* plot i(v2) or plot i(vout) - It plots the current values of corresponding branch. Here we have connect 0v voltage source in series(vs or v1),to find current in particular branch.
* plot mag(v(2)) or print mag(v(2)) - It plots or prints magnitude values of corresponding node.
* plot db(v(2)) or print db(v(2)) - It plots or prints voltage values of corresponding node in decibel.
* plot imag(v(2)) or print imag(v(2)) - It plots or prints imaginary part of voltage values of corresponding node.
* plot phase(v(2)) or print phase(v(2))- It plots or prints phase values of corresponding node in radian.
* plot 180/PI*phase(v(2)) or print 180/PI*phase(v(2)) - It plots or prints phase values of corresponding node in degree.  

There is still work being done to try and figure out how all these commands can be used without errors. Research is aimed toward continuing to learn how different outputs can be found and used. One current error message that is popping up when a plot command is run with NGSPice is "Can't open viewport for graphics."         
