# World2Viewport

This is a module to transform 2-dimensional world coordinates to viewport coordinates *and also vice-versa*. It deals with camera offset and aspect ratio for you.

It may be useful in games and other apps where you need to translate the view along elements positioned in a 2D space.

There are just 4 exported functions in [`index.mjs`](./index.mjs), with JSDoc documentation available:

- [`worldToViewport`](./index.mjs#L28), [`viewportToWorld`](./index.mjs#L59) to transform coordinates.
- [`worldToViewportLength`](./index.mjs#L89), [`viewportToWorldLength`](./index.mjs#L105) to transform length (of, say, a line segment).

The functions take following arguments:

- `x`, `y` - initial coordinates
- `vx`, `vy` - view offset ("camera" position)
- `vw` - view scale (see below)
- `vpW`, `vpH` - viewport width and height
- `params` - additional parameters such as sizing (see below)

Here's [usage example](./example.html).

## Notes

"View offset" is "camera" position.

"View scale" (ofter referred to as `vw`) is how much of world fits from the center of the viewport to the edge of the viewport (meaning `(2 * vw)` is entire viewport). The larger the value, the larger the visible area.

Camera is in the center of the viewport. The Y-axis points up.

So, if you have your camera set up at **(0, 0)** with scale of **4.0** and you have an entity at **(4.0, -4.0)**, it will appear at the **bottom-right corner** of the screen.

"Sizing" determines what does `vw` actually refers too. See JSDoc and the example to understand it and find out possible values.

## Explaination and math

I specifically made the code as *apprehensible* as possible and added lots of comments. In total, there are 143 lines of code, 1 private function besides the 4 public ones.

The math part is easy, but the algorithm might be confusing, especially when dealing with aspect ratio.

Also see the [example](./example.html).
