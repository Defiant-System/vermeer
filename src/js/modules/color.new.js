
const ColorLib = {
	clamp: (num, min, max) => Math.min(Math.max(num, min), max),
	intToHex: i => i.toString(16).padStart(2, "0"),
	hslToRgb(hsl) {
		let _round = Math.round,
			_min = Math.min,
			_max = Math.max,
			h = hsl.h,
			s = hsl.s,
			l = hsl.l,
			a = hsl.a || 1,
			c = s * _min(l, 1-l),
			f = (n, k = (n + h / 30) % 12) => l - c * _max(_min(k - 3, 9 - k, 1), -1),
			r = _round(f(0) * 255),
			g = _round(f(8) * 255),
			b = _round(f(4) * 255);
		return { r, g, b, a };
	},
	hslToHex(hsl) {
		let rgb = this.hslToRgb(hsl);
		return this.rgbToHex(rgb);
	},
	rgbToHsv(rgb) {
		let r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255,
			a = (rgb.a || 255) / 255,
			_round = Math.round,
			max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			delta = max - min,
			hue = 0,
			value = max,
			saturation = max === 0 ? 0 : delta / max;
		switch (max) {
			case min: hue = 0; break; // achromatic
			case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
			case g: hue = (b - r) / delta + 2; break;
			case b: hue = (r - g) / delta + 4; break;
		}
		return {
			h: _round(hue * 60 % 360),
			s: _round(this.clamp(saturation * 100, 0, 100)) / 100,
			v: _round(this.clamp(value * 100, 0, 100)) / 100,
			a
		};
	},
	rgbToHex(rgb) {
		if (typeof rgb === "string") rgb = this.parseRgb(rgb);
		let r = this.intToHex(Math.round(rgb.r)),
			g = this.intToHex(Math.round(rgb.g)),
			b = this.intToHex(Math.round(rgb.b));
		return `#${r}${g}${b}`;
	},
	rgbToHsl(rgb) {
		let r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255,
			max = Math.max(r, g, b),
			min = Math.min(r, g, b),
			h,
			s,
			l = (max + min) / 2;
		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return { h: h * 360, s, l };
	},
	hexToHsv(hex) {
		let rgb = this.hexToRgb(hex);
		return this.rgbToHsv(rgb);
	},
	hexToHsl(hex) {
		let rgb = this.hexToRgb(hex);
		return this.rgbToHsl(rgb);
	},
	hsvToHex(hsv) {
		let hsl = this.hsvToHsl(hsv);
		return this.hslToHex(hsl);
	},
	hsvToHsl(hsv) {
		let _round = Math.round,
			s = hsv.s / 100,
			v = hsv.v / 100,
			l = (2 - s) * v,
			d = l <= 1 ? l : 2 - l, // Avoid division by zero when lightness is close to zer0
			sat = d < 1e-9 ? 0 : s * v / d;
		return {
			h: _round(hsv.h),
			s: _round(this.clamp(sat * 100, 0, 100)),
			l: _round(this.clamp(l * 50, 0, 100)),
			a: hsv.a || 1
		};
	},
	hexToRgb(hex) {
		let r = parseInt(hex.substr(1,2), 16),
			g = parseInt(hex.substr(3,2), 16),
			b = parseInt(hex.substr(5,2), 16),
			a = parseInt(hex.substr(7,2) || "ff", 16) / 255;
		return { r, g, b, a };
	},
	mixColors(hex1, hex2, p) {
		let rgb1 = this.hexToRgb(hex1),
			rgb2 = this.hexToRgb(hex2),
			w = p * 2 - 1,
			w1 = (w + 1) / 2.0,
			w2 = 1 - w1,
			rgb = {
				r: parseInt(rgb1.r * w1 + rgb2.r * w2, 10),
				g: parseInt(rgb1.g * w1 + rgb2.g * w2, 10),
				b: parseInt(rgb1.b * w1 + rgb2.b * w2, 10),
				a: rgb1.a * w1 + rgb2.a * w2
			};
		return this.rgbToHex(rgb);
	},
	parseRgb(str) {
		let s = str.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\.\d]+)\)$/);
		if (!s) s = str.match(/^rgb?\((\d+),\s*(\d+),\s*(\d+)\)$/);
		let a = Math.round((+s[4] || 1) * 255),
			r = +s[1],
			g = +s[2],
			b = +s[3];
		return { r, g, b, a };
	}
};
