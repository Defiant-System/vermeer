/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 */
 
class SimplexNoise {
	constructor(randomOrSeed) {
		this.F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
		this.G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

		let random = Math.random;

		if (typeof randomOrSeed == 'function') {
			random = randomOrSeed;
		} else if (randomOrSeed) {
			random = alea(randomOrSeed);
		}

		this.p = new Uint8Array(256);
		this.perm = new Uint8Array(512);
		this.permMod12 = new Uint8Array(512);

		for (let i=0; i<256; i++) {
			this.p[i] = random() * 256;
		}

		for (let i=0; i<512; i++) {
			this.perm[i] = this.p[i & 255];
			this.permMod12[i] = this.perm[i] % 12;
		}

		this.grad3 = new Float32Array([1, 1, 0, - 1, 1, 0, 1, - 1, 0, - 1, - 1, 0, 1, 0, 1, - 1, 0, 1, 1, 0, - 1, - 1, 0, - 1, 0, 1, 1, 0, - 1, 1, 0, 1, - 1, 0, - 1, - 1]);
		this.grad4 = new Float32Array([0, 1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1, 0, - 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1, 1, 0, 1, 1, 1, 0, 1, - 1, 1, 0, - 1, 1, 1, 0, - 1, - 1, - 1, 0, 1, 1, - 1, 0, 1, - 1, - 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 1, 0, 1, 1, 1, 0, - 1, 1, - 1, 0, 1, 1, - 1, 0, - 1, - 1, 1, 0, 1, - 1, 1, 0, - 1, - 1, - 1, 0, 1, - 1, - 1, 0, - 1, 1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1, 0, - 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1, 0]);
	}

	noise2D(xin, yin) {
		let permMod12 = this.permMod12,
			perm = this.perm,
			grad3 = this.grad3,
			n0=0, n1=0, n2=0; // Noise contributions from the three corners
		// Skew the input space to determine which simplex cell we're in
		let s = (xin + yin) * this.F2, // Hairy factor for 2D
			i = Math.floor(xin + s),
			j = Math.floor(yin + s),
			t = (i + j) * this.G2,
			X0 = i - t, // Unskew the cell origin back to (x,y) space
			Y0 = j - t,
			x0 = xin - X0, // The x,y distances from the cell origin
			y0 = yin - Y0,
			// For the 2D case, the simplex shape is an equilateral triangle.
			// Determine which simplex we are in.
			i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
		if (x0 > y0) {
			i1 = 1;
			j1 = 0;
		} else { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
			i1 = 0;
			j1 = 1;
		} // upper triangle, YX order: (0,0)->(0,1)->(1,1)
		// A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
		// a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
		// c = (3-sqrt(3))/6
		let x1 = x0 - i1 + this.G2, // Offsets for middle corner in (x,y) unskewed coords
			y1 = y0 - j1 + this.G2,
			x2 = x0 - 1.0 + 2.0 * this.G2, // Offsets for last corner in (x,y) unskewed coords
			y2 = y0 - 1.0 + 2.0 * this.G2,
			// Work out the hashed gradient indices of the three simplex corners
			ii = i & 255,
			jj = j & 255,
			// Calculate the contribution from the three corners
			t0 = 0.5 - x0 * x0 - y0 * y0;
		if (t0 >= 0) {
			let gi0 = permMod12[ii + perm[jj]] * 3;
			t0 *= t0;
			n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
		}
		let t1 = 0.5 - x1 * x1 - y1 * y1;
		if (t1 >= 0) {
			let gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
			t1 *= t1;
			n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
		}
		let t2 = 0.5 - x2 * x2 - y2 * y2;
		if (t2 >= 0) {
			let gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
			t2 *= t2;
			n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
		}
		// Add contributions from each corner to get the final noise value.
		// The result is scaled to return values in the interval [-1,1].
		return 70.0 * (n0 + n1 + n2);
	}
}
