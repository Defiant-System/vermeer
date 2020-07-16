
class Mash {
	constructor(data) {
		data = data.toString();

		let n = 0xefc8249d,
			i = 0,
			il = data.length;
		for (; i<il; i++) {
			n += data.charCodeAt(i);
			let h = 0.02519603282416938 * n;
			n = h >>> 0;
			h -= n;
			h *= n;
			n = h >>> 0;
			h -= n;
			n += h * 0x100000000; // 2^32
		}

		return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
	}

	get version() {
		return "Mash 0.9";
	}
}

class Alea {
	constructor(args) {
		// Johannes Baagøe <baagoe@baagoe.com>, 2010
		if (args.length == 0) {
			args = [+new Date];
		}

		let mash = Mash();
		this.s0 = mash(" ");
		this.s1 = mash(" ");
		this.s2 = mash(" ");
		this.c = 1;

		for (let i=0, il=args.length; i<il; i++) {
			this.s0 -= mash(args[i]);
			if (this.s0 < 0) {
				this.s0 += 1;
			}
			this.s1 -= mash(args[i]);
			if (this.s1 < 0) {
				this.s1 += 1;
			}
			this.s2 -= mash(args[i]);
			if (this.s2 < 0) {
				this.s2 += 1;
			}
		}
	}

	random() {
		let t = 2091639 * this.s0 + c * 2.3283064365386963e-10; // 2^-32
		this.s0 = this.s1;
		this.s1 = this.s2;
		return this.s2 = t - (this.c = t | 0);
	}

	uint32() {
		return this.random() * 0x100000000; // 2^32
	}

	fract53() {
		return this.random() + (this.random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
	}

	exportState() {
		return [this.s0, this.s1, this.s2, this.c];
	}

	static importState(i) {
		let random = new Alea(i);

		random.s0 = +i[0] || 0;
		random.s1 = +i[1] || 0;
		random.s2 = +i[2] || 0;
		random.c = +i[3] || 0;

		return random;
	}

	get version() {
		return "Alea 0.9";
	}
}
