# Common issues with pull requests
1. hardcoding values
    * if you are hardcoding the same value over and over make a constant for it in Constants.ts and use that new constant instead

2. non-descript variable names
    * When submitting a PR make sure your variables names are descriptive 

3. Passing checks
    * Before submitting a PR make sure you run the tests (yarn test) to make sure everything is still working correctly after your changes

4. Imports
    * Before Submitting a PR consult the import style guide to make sure your order of imports adheres to it

5. Please make sure the changes in your PR actually belong in your PR
    * Don't make random or unnecessary changes that don't have anything to do with the issues your working on
    * If you’re working on multiple issues you should have a separate branch and pull request for each issue

6. Run OpenCircuits
* make sure OpenCircuits still runs after the changes you've made and test out the changes you've made to ensure they are working

7. Don't re-implement code
    * If you are unsure if some functionality already exists in the codebase you should ask rather attempting to re-implement it

8. Comments
    * If you think a peice of code will be hard for another person to understand make sure to write comments 

9. Stick to the code formatting around you
    * make sure the style and formatting of the code is the same before and after you've changed it

10. tabs 
    * Don't submit a PR with Tabs in it (any tabs should instead be 4 spaces)

11. Remove extraneous comments
    * If your PR has comments that are no longer relevant to the code make sure to remove them

12. Whitespace
    * Make sure there is no extra whitespace in your PR

13. Make sure you include a space after if
    *  Do ```if (bool)``` not ```if(bool)```

14. Make sure you have an space after each comment
    *  Do ```// "stuff"``` not ```//"stuff"```

