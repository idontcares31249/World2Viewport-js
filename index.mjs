/** @typedef {[number, number]} Vector2 */
/**
 * - `'cover'` will never show anything out of bounds of `vw`
 * - `'contain'` will always show bounds of at least `vw` on both axes
 * - `'horizontal'` will bind `vw` to x-axis
 * - `'vertical'` will bind `vw` to y-axis
 * - `'stretch'` will stretch image to fit `vw` on both axes
 * @typedef {'cover' | 'contain' | 'horizontal' | 'vertical' | 'stretch'} Sizing
 */
/**
 * @typedef ViewportParameters
 * @prop {number} viewportWidth
 * @prop {number} viewportHeight
 * @prop {Sizing=} sizing
 * @prop {boolean=} vert This parameter has effect only in `*To*Length` functions in stretch sizing
 */

/**
 * Transforms world space to viewport space
 * @param {number} x Entity coord
 * @param {number} y Entity coord
 * @param {number} vx View offset
 * @param {number} vy View offset
 * @param {number} vw View scale
 * @param {ViewportParameters} vpParams
 * @returns {[number, number]} Viewport coords
 */
export function worldToViewport(x, y, vx, vy, vw, vpParams) {
	const
		{ viewportWidth, viewportHeight } = vpParams;
	let
		[sx, sy] = determineScale(vw, vpParams),
		rx = x, ry = y;
	// camera offset (as both camera and the entity are in the same coord space)
		rx -= vx; ry -= vy;
	// now we need to linearly map from [-vw .. +vw] to [0 .. viewportSize]
			rx /= sx; ry /= sy;
		// [-1 .. +1]
			rx += 1; ry += 1;
		// [0 .. 2]
			rx /= 2; ry /= 2;
		// [0 .. 1]
			rx *= viewportWidth; ry *= viewportHeight;
		// done
	// y is flipped on viewport
		ry = viewportHeight - ry;
	return [rx, ry];
}
/**
 * Transforms viewport coords to world coords
 * @param {number} x Viewport coord
 * @param {number} y Viewport coord
 * @param {number} vx View offset
 * @param {number} vy View offset
 * @param {number} vw View scale: how much of world fits from the center of the viewport to the edge of the viewport
 * @param {ViewportParameters} vpParams
 * @returns {[number, number]} Entity coords
 */
export function viewportToWorld(x, y, vx, vy, vw, vpParams) {
	const
		{ viewportWidth, viewportHeight } = vpParams;
	let
		[sx, sy] = determineScale(vw, vpParams),
		rx = x, ry = y;
	// basically, doing everything in reverse
	// y is flipped on viewport
		ry = viewportHeight - ry;
	// now we need to linearly map from [0 .. viewportSize] to [-vw .. +vw]
			rx /= viewportWidth; ry /= viewportHeight;
		// [0 .. 1]
			rx *= 2; ry *= 2;
		// [0 .. 2]
			rx -= 1; ry -= 1;
		// [-1 .. +1]
			rx *= sx; ry *= sy;
		// done
	// camera offset
		rx += vx; ry += vy;
	return [rx, ry];
}
/**
 * Calculate how much space does a length take when transformed from world to viewport.
 * (Note that x- and y-axes are not uniform when using stretch sizing)
 * @param {number} length In meters
 * @param {number} vw View scale
 * @param {ViewportParameters} vpParams
 * @returns {number} In pixels
 */
export function worldToViewportLength(length, vw, vpParams) {
	let [sx, sy] = determineScale(vw, vpParams);
	// we just need to map the value from [0 .. vw] to [0 .. viewportSize / 2]
	return length / 2 * (vpParams.vert ? vpParams.viewportHeight / sy : vpParams.viewportWidth / sx);
	// hacky and a bit less performant but at least we're not duplicating the code
}
/**
 * Calculate how much space does a length take when transformed from viewport to world.
 * (Note that x- and y-axes are not uniform when using stretch sizing)
 * @param {number} length In pixels
 * @param {number} vw View scale
 * @param {ViewportParameters} vpParams
 * @returns {number} In meters
 */
export function viewportToWorldLength(length, vw, vpParams) {
	let [sx, sy] = determineScale(vw, vpParams);
	// map from [0 .. viewportSize / 2] to [0 .. vw]
	return length * 2 * (vpParams.vert ? sy / vpParams.viewportHeight : sx / vpParams.viewportWidth);
}

// private functions:

function determineScale(vw, { viewportWidth, viewportHeight, sizing = 'cover' }) {
	// this functions returns [sx, sy]
	// basically it assigns vw to one of the return values
	// the hardest part is to find which one
	// and then we just calculate the other by multiplying/dividing vw by aspect ratio.
	// (more clarification: multiplying when it's x, dividing when it's y)

	const
		aspect = viewportWidth / viewportHeight,
		isLandscape = viewportWidth > viewportHeight;  // orientation: w > h => landscape, w < h => portrait
	switch (sizing) {
		case 'cover':
			if (isLandscape)
				return [vw, vw / aspect];
			else
				return [vw * aspect, vw];
		case 'contain':
			if (isLandscape)
				return [vw * aspect, vw];
			else
				return [vw, vw / aspect];
		case 'horizontal':
			return [vw, vw / aspect];
		case 'vertical':
			return [vw * aspect, vw];
		case 'stretch':
			return [vw, vw];
		default:
			throw new TypeError(`Invalid sizing`);
	}
}