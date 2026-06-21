# Math Utilities (`utils/math`)

This directory contains a suite of general-purpose, dependency-free mathematical and geometric utilities. These classes and functions are primarily used by the `assembly` layer for rendering, layout, and spatial queries (like hit-testing and bounding box calculations).

## Files

- **`BezierCurve.ts`**: Implements a cubic Bezier curve, allowing evaluation of position and derivatives at any parameter `t`, and computes its bounding box.
- **`ClampedValue.ts`**: A wrapper around a number that strictly enforces minimum and maximum bounds upon mutation.
- **`Curve.ts`**: An abstract base class for parametric curves, defining the interface for evaluating positions and first/second derivatives.
- **`Graph.ts`**: A generic directed graph data structure implementation, providing algorithms like Depth First Search and topological depth calculations.
- **`Line.ts`**: Implements a simple straight line parametric `Curve`.
- **`MathUtils.ts`**: A collection of assorted math functions. Includes clamping, modulus, Separating Axis Theorem (SAT) collision detection, root finding (via Newton's method) for evaluating if a point is on a curve, and array generation (`linspace`).
- **`Matrix.ts`**: A 2x3 Matrix class used to represent 2D affine transformations (translation, rotation, scale) with support for inversion and matrix multiplication.
- **`QuadCurve.ts`**: Implements a quadratic Bezier curve `Curve`.
- **`Rect.ts`**: An Axis-Aligned Bounding Box (AABB) implementation, supporting expansion, margins, intersection checks, and geometric subtractions.
- **`Transform.ts`**: Represents a 2D Oriented Bounding Box composed of a position, rotation, and scale. It uses `Matrix2x3` internally to convert points between local and world space and evaluate intersections.
- **`Vector.ts`**: A standard immutable 2D Vector class representing `(x, y)` coordinates.
