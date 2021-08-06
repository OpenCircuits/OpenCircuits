---
title: Template
---


import TOCInline from '@theme/TOCInline';
import Timeline from './_timeline';


##### Copy the markdown below this line for your design docs!
---


<div style={{height: "80px", width: "100%"}}>
<img src="/img/icon.svg" width="80px" style={{float: "right"}} />
</div>


# *TITLE* Design Doc
#### *[PERSON 1](https://github.com/Person1)*, *[PERSON 2](https://github.com/Person2)*, ... (Last updated *DATE*)


<details>
    <summary>
        Table of Contents
    </summary>
    <TOCInline toc={toc} />
</details>


## Overview

(insert high-level summary of what you're trying to accomplish that anyone can understand)



## Context

(a description of why this is necessary and the problem this aims to solve)



## Goals & Non-Goals

### Goals:
- (list out each goal/feature)

### Non-Goals:
- (list of things you DON'T plan on doing in this feature)



## Milestones

<Timeline 
    start="Start Date" 
    milestones={[{
        date: "Date 1",
        explanation: "Brief explanation",
    }, {
        date: "Date 2",
        explanation: "Brief explanation",
    }, {
        date: "Date 3",
        explanation: "Brief explanation",
    }]} 
    end="End Date" />



## Existing Solution

(describe if the issue/feature is already doable and how it's doable)



## Proposed Solution

(write a specific "walk-through" of how the solution fixes the problem)



## Alternative Solutions

- (describe other considered solutions and explain why they were not chosen)



## Testability

(describe how the issue/feature will be tested)



## Impact

(does this impact other parts of the project? i.e. potentially exposes security vulnerabilities,
 causes lag? What are some of the negative consequences and side effects?)



## Known Unknowns

(describe open issues that you aren't sure about)



## Detailed Scoping

(breakdown exactly HOW you plan on executing each part of the project,
go in order of when you plan doing each part as well
THIS IS THE PLACE TO VERY TECHNICAL ABOUT EXACT IMPLEMENTATION DETAILS
AND WILL MOST LIKELY BE THE LONGEST PART OF THE DESIGN DOC)


### Milestone 1

Detailed explanation


### Milestone 2

Detailed explanation


### Milestone 3

Detailed explanation
