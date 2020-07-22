
export function createCanvas(w, h) {
	let cvs = document.createElement("canvas"),
		ctx = cvs.getContext("2d");
	cvs.width = w || 1;
	cvs.height = h || 1;
	return { cvs, ctx };
}

export function loadImage(url) {
	return new Promise(resolve => {
		let img = new Image;
		img.src = url;
		img.onload = () => resolve(img);
	})
}

export function getImageData(img) {
	let w = ~~img.naturalWidth,
		h = ~~img.naturalHeight,
		{ cvs, ctx } = createCanvas(w, h);
	ctx.drawImage(img, 0, 0, w, h);
	return ctx.getImageData(0, 0, w, h);
}

export function scaleImage(img, w, h) {
	let { cvs, ctx } = createCanvas(w, h);
	ctx.drawImage(img, 0, 0, w, h);
	return cvs;
}

// results in a much smoother image
export function scaleImageHQ(image, w, h) {
	let iw = (image.naturalWidth || image.width),
		ih = (image.naturalHeight || image.height);
	if (iw > w * 2 && ih > h * 2) {
		image = scaleImage(image, w * 2, h * 2);
	}
	return scaleImage(image, w, h);
}

// tested against https://github.com/recurser/exif-orientation-examples
export function exifOrient(img, orientation) {
	let w = ~~(img.naturalWidth || img.width),
		h = ~~(img.naturalHeight || img.height),
		{ cvs, ctx } = createCanvas(w, h),
		rotate = n => {
			ctx.translate(cvs.width/2, cvs.height/2);
			ctx.rotate(Math.PI*n);
			ctx.translate(-cvs.width/2, -cvs.height/2);
		};

	// set dimensions
	if (orientation < 5) {
		cvs.width = w;
		cvs.height = h;
	} else {
		cvs.width = h;
		cvs.height = w;
	}
	// flip x
	if (orientation == 2 || orientation == 5 || orientation == 7) {
		ctx.translate(cvs.width, 0);
		ctx.scale(-1, 1);
	}
	// flip y
	if (orientation == 4) {
		ctx.translate(0, cvs.height);
		ctx.scale(1, -1);
	}

	if (orientation == 3)  {
		rotate(1);
	}
	if (orientation == 5 || orientation == 6) {
		rotate(0.5);
	}
	if (orientation == 7 || orientation == 8) {
		rotate(-0.5);
	}
	// move it back to the corner
	if (orientation > 4) {
		let o = (cvs.width - cvs.height)/2;
		ctx.translate(o, -o);
	}

	ctx.drawImage(img, 0, 0);
	cvs.naturalWidth = cvs.width;
	cvs.naturalHeight = cvs.height;
	return c;
}
