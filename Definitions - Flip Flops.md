# Welcome to OpenCircuits!

I wanted to create this document to define the flip flop electrical components used OpenCircuits.

# SR
When the clock rises from 0 to 1, the value remembered by the flip-flop remains unchanged if R and S are both 0, becomes 0 if the R input (Reset) is 1, and becomes 1 if the S input (Set) is 1. The behavior in unspecified if both inputs are 1. (In Logisim, the value in the flip-flop remains unchanged.)

# JK 
When the clock rises from 0 to 1, the value remembered by the flip-flop toggles if the J and K inputs are both 1, remains the same if they are both 0, and changes to the K input value if J and K are not equal. (The names J and K do not stand for anything.)

# D
When the clock rises from 0 to 1, the value remembered by the flip-flop becomes the value of the D input (Data) at that instant.

#T
When the clock rises from 0 to 1, the value remembered by the flip-flop either toggles or remains the same depending on whether the T input (Toggle) is 1 or 0.

* Source: http://www.cburch.com/logisim/docs/2.1.0/libs/mem/flipflops.html
