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
 * @typedef Parameters
 * @prop {Sizing=} sizing `'cover`' is default
 * @prop {boolean=} vert This parameter has effect only in `*To*Length` functions in stretch sizing
 */

/**
 * Transforms world space to viewport space
 * @param {number} x Entity coord
 * @param {number} y Entity coord
 * @param {number} vx View offset
 * @param {number} vy View offset
 * @param {number} vw View scale
 * @param {number} vpW Viewport width
 * @param {number} vpH Viewport height
 * @param {Parameters} params
 * @returns {[number, number]} Viewport coords
 */
export function worldToViewport(x, y, vx, vy, vw, vpW, vpH, params) {
	let
		[sx, sy] = determineScale(vw, vpW, vpH, params),
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
			rx *= vpW; ry *= vpH;
		// done
	// y is flipped on viewport
		ry = vpH - ry;
	return [rx, ry];
}
/**
 * Transforms viewport coords to world coords
 * @param {number} x Viewport coord
 * @param {number} y Viewport coord
 * @param {number} vx View offset
 * @param {number} vy View offset
 * @param {number} vw View scale
 * @param {number} vpW Viewport width
 * @param {number} vpH Viewport height
 * @param {Parameters} params
 * @returns {[number, number]} Entity coords
 */
export function viewportToWorld(x, y, vx, vy, vw, vpW, vpH, params) {
	let
		[sx, sy] = determineScale(vw, vpW, vpH, params),
		rx = x, ry = y;
	// basically, doing everything in reverse
	// y is flipped on viewport
		ry = vpH - ry;
	// now we need to linearly map from [0 .. viewportSize] to [-vw .. +vw]
			rx /= vpW; ry /= vpH;
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
 * @param {number} vpW Viewport wi`dth
 * @param {number} vpH viewport he`ight
 * @param {Parameters} params`
 * @returns {number} In pixels
 */
export function worldToViewportLength(length, vw, vpW, vpH, params) {
	let [sx, sy] = determineScale(vw, vpW, vpH, params);
	// we just need to map the value from [0 .. vw] to [0 .. viewportSize / 2]
	return length / 2 * (params.vert ? vpH / sy : vpW / sx);
	// hacky and a bit less performant but at least we're not duplicating the code
}
/**
 * Calculate how much space does a length take when transformed from viewport to world.
 * (Note that x- and y-axes are not uniform when using stretch sizing)
 * @param {number} length In pixels
 * @param {number} vw View scale
 * @param {number} vpW Viewport width
 * @param {number} vpH Viewport height
 * @param {Parameters} params
 * @returns {number} In meters
 */
export function viewportToWorldLength(length, vw, vpW, vpH, params) {
	let [sx, sy] = determineScale(vw, vpW, vpH, params);
	// map from [0 .. viewportSize / 2] to [0 .. vw]
	return length * 2 * (params.vert ? sy / vpH : sx / vpW);
}

// private functions:

function determineScale(vw, vpW, vpH, { sizing = 'cover' } = {}) {
	// this functions returns [sx, sy]
	// basically it assigns vw to one of the return values
	// the hardest part is to find which one
	// and then we just calculate the other by multiplying/dividing vw by aspect ratio.
	// (more clarification: multiplying when it's x, dividing when it's y)

	const
		aspect = vpW / vpH,
		isLandscape = vpW > vpH;  // orientation: w > h => landscape, w < h => portrait
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