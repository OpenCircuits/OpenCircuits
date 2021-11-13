# Common mistakes made on pull requests.
## Before submitting a pull request go over this list and make sure
## you have avoided common pitfalls
1. Don't hardcode values
    * if you find yourself hardcoding the same value over and over again you should probably make a constant for it in Constants.ts
        and use the new constant instead
2. Don't use non-descriptive variable name
    * When submitting a PR make sure your variables names are descriptive 

3. Passing checks
    * Before you submit a PR make sure you run the tests (yarn test) to make everything is still working correctly after your changes

4. Imports
    * Before Submitting a PR consult the import style guide to make sure your order of imports adheres to it

5. Please make sure the changes in your PR actually belong in your PR
    * Don't make random or unnecessary changes that don't have anything to do with the issues your working on
    * If you’re working on multiple issues you should have a separate branch and pull request for each issue don't mix and match

6. Run OpenCircuits
* make sure OpenCircuits still runs after the changes you've made and test out the changes you've made to ensure they are working as well

7. When in doubt ask 
    * If you don't know how to do something or are unsure if some functionality already exists in the codebase rather than be stuck
    or re-implement code you should ask about it
8. Comments
    * If you find yourself writing a long and complicated blob of code make sure to comment so whoever is reviewing your PR actually
    know what is going on

9. If you find yourself rewriting the same block of code over and over you should probably make a shared method instead

10. Stick to the code formatting around you
    * make sure the style and formatting of the code is the same before and after you've changed it

11. tabs 
    * Don't submit a PR with Tabs in it (any tabs should instead be 4 spaces)

12. If you commit out chunks of code that are no longer used make sure to delete that code

13. Make sure there is no extra whitespace in your PR

14. Make sure you include a space after if
    *  Do ```if (bool)``` not ```if(bool)```
15. Make sure you have an space after each comment
    *  Do ```// "stuff"``` not ```//"stuff"```

