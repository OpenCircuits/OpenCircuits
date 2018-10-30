"use strict";

var Transform = require("./Transform");

var MathUtils = function () {
    return {
        /**
         * Compares two transforms to see if they overlap.
         * First tests it using a quick circle-circle
         * intersection using the 'radius' of the transform
         *
         * Then uses a SAT (Separating Axis Theorem) method
         * to determine whether or not the two transforms
         * are intersecting
         *
         * @param  {Transform} a
         *         The first transform
         *
         * @param  {Transform} b
         *         The second transform
         *
         * @return {Boolean}
         *         True if the two transforms are overlapping,
         *         false otherwise
         */
        TransformContains: function (A, B) {
            // If both transforms are non-rotated
            if (Math.abs(A.getAngle()) <= 1e-5 && Math.abs(B.getAngle()) <= 1e-5) {
                var aPos = A.getPos(),
                    aSize = A.getSize();
                var bPos = B.getPos(),
                    bSize = B.getSize();
                return Math.abs(aPos.x - bPos.x) * 2 < aSize.x + bSize.x && Math.abs(aPos.y - bPos.y) * 2 < aSize.y + bSize.y;
            }

            // Quick check circle-circle intersection
            var r1 = A.getRadius();
            var r2 = B.getRadius();
            var sr = r1 + r2; // Sum of radius
            var dpos = A.getPos().sub(B.getPos()); // Delta position
            if (dpos.dot(dpos) > sr * sr) return false;

            /* Perform SAT */

            // Get corners in local space of transform A
            var a = A.getLocalCorners();

            // Transform B's corners into A local space
            var bworld = B.getCorners();
            var b = [];
            for (var i = 0; i < 4; i++) {
                b[i] = A.toLocalSpace(bworld[i]);

                // Offsets x and y to fix perfect lines
                // where b[0] = b[1] & b[2] = b[3]
                b[i].x += 0.0001 * i;
                b[i].y += 0.0001 * i;
            }

            var corners = a.concat(b);

            var minA, maxA, minB, maxB;

            // SAT w/ x-axis
            // Axis is <1, 0>
            // So dot product is just the x-value
            minA = maxA = corners[0].x;
            minB = maxB = corners[4].x;
            for (var j = 1; j < 4; j++) {
                minA = Math.min(corners[j].x, minA);
                maxA = Math.max(corners[j].x, maxA);
                minB = Math.min(corners[j + 4].x, minB);
                maxB = Math.max(corners[j + 4].x, maxB);
            }
            if (maxA < minB || maxB < minA) return false;

            // SAT w/ y-axis
            // Axis is <1, 0>
            // So dot product is just the y-value
            minA = maxA = corners[0].y;
            minB = maxB = corners[4].y;
            for (var j = 1; j < 4; j++) {
                minA = Math.min(corners[j].y, minA);
                maxA = Math.max(corners[j].y, maxA);
                minB = Math.min(corners[j + 4].y, minB);
                maxB = Math.max(corners[j + 4].y, maxB);
            }
            if (maxA < minB || maxB < minA) return false;

            // SAT w/ other two axes
            var normals = [b[3].sub(b[0]), b[3].sub(b[2])];
            for (var i = 0; i < normals.length; i++) {
                var normal = normals[i];
                var minA = Infinity,
                    maxA = -Infinity;
                var minB = Infinity,
                    maxB = -Infinity;
                for (var j = 0; j < 4; j++) {
                    var s = corners[j].dot(normal);
                    minA = Math.min(s, minA);
                    maxA = Math.max(s, maxA);
                    var s2 = corners[j + 4].dot(normal);
                    minB = Math.min(s2, minB);
                    maxB = Math.max(s2, maxB);
                }
                if (maxA < minB || maxB < minA) return false;
            }

            return true;
        }
    };
}();

module.exports = MathUtils;