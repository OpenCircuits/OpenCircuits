---
title: General Tour
---


import TOCInline from '@theme/TOCInline';
import Timeline from './_timeline';


---


<div style={{height: "80px", width: "100%"}}>
<img src="/img/icon.svg" width="80px" style={{float: "right"}} />
</div>


# *General Tour* Design Doc
#### *[Trevor Crystal](https://github.com/TGCrystal)* (Last updated *11/4/2021*)


<details>
    <summary>
        Table of Contents
    </summary>
    <TOCInline toc={toc} />
</details>


## Overview

The goal of this feature is to create a tour that shows new users how to use OpenCircuits. This includes things like placing and connecting components.



## Context

New users may not immediately see the itemnav to open to place components. Also, some more useful yet advanced features like creating ICs may be hard to find for users. The implementation will allow these features and more (with extensibility for more new features implemented in the future as well).



## Goals & Non-Goals

### Goals:
- Define a json (or other format) that allows for easy specification of a tutorial
- When the user loads the page for the first time, it should display a basic tutorial for creating/connecting Switches to ANDGate to LED
- End of initial tutorial should show location in UI where other tutorials can be started (and the initial one can be redone)

### Non-Goals:
- This is not creating any sort of separate page like issues #369, #370, or #371, it is all part of the circuit designer



## Milestones

<Timeline 
    start="Start Date" 
    milestones={[{
        date: "11/8/21",
        explanation: "Finalize json format",
    }, {
        date: "12/31/21",
        explanation: "Connect the json format to things actually happening in the tour",
    }]} 
    end="End Date" />



## Existing Solution

Have someone already familiar with OpenCircuits teach you or figure it out on your own.



## Proposed Solution

First time users will be given a walkthrough of how to use OpenCircuits. The item nav would be highlighted, and then the components required to drag onto the campus would also be 



## Alternative Solutions

Video tutorials could work, but showing the user how to use the program in an interactive way is far more intuitive and useful.



## Testability

Currently, frontend testing does not exist so there is little that can be tested. There could possibly be some sort testing of a parser to help process the json file input, but the exact method of converting to json to actual tutorial has yet to be determined, so testability is not yet fully determined.



## Impact

There should be a single button that can be used to exit the tutorial at any point. 



## Known Unknowns

Basically all implementation details are still unknown, this section and milestone details will be filled in later.



## Detailed Scoping

(To be determined)


### Milestone 1

Detailed explanation pending


### Milestone 2

Detailed explanation pending
