# DC Analysis
1. Performing Analysis when DC Sources are Used
    * DC sources mean all sources should be applying a constant current/voltage.
    * This Analysis would be similar to running with "DC Operating Point" in LTSpice
2. This Analysis Can Not be Validly Performed with Time-Varying Signals
    * Output results should be invalid as it makes no sense to have time-varying signals in a DC Analysis.
3. Linear (IV-curve) Components Have their Properties Determined According to Simple Linear Equations
    * These include Resistors whose properties are dictated by Ohm's Law (V = I*R).
4. Nonlinear Components Could have their DC Steady State Values Reported
    * These components include Inductors and Capacitors whose voltages/currents will change with time even as a DC signal is applied to them
    * A DC Analysis essentially take the limit as time goes to infinity in these instances, resulting in reporting the "DC Steady States" of these components. These will be DC values that reflect the values which properties of these components wil always be moving closer towards.
5. DC Analysis Results can Simply be Output in a new Window or Text Box
    * Using an Oscilloscope to plot DC values would only result in a bunch of straight lines. Instead of this the output can simply be the calulated values themselves (rounded to a reasonable number of significant digits) with there associated component or node.
    * The voltages for each node can be reported along with the currents through each component.
    * If the node was labeled by the user, then this label should show up in in the report as well. This should only be applied to labeled nodes as it allows the user to isolate certain nodes for their analysis.