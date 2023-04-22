# ll-stlc

STLC is helpful in getting the type inference engine working without the clutter of complexity. This language has the following characteristics:

- Bool, Int and higher-order function data types
- Lambda functions
- Explicit recursive functions using let rec

The bits that I found most helpful with this project is:

- Determining how to infer let rec - the literature often implies that this is trivial however it is certainly not trivial for a practitioner given the subtleties that need to be worked through.
- When to solve over the constraints and when to defer - this is material in getting the most general type solution.
