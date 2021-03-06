
import { getImageData, loadImage } from "./image-helpers";

let lastUrl, lastPromise;

// contains an index of color lookup tables, and caches the last one used
const clut = {
	root: "/cdn/img/cluts/",
	get: url => {
		if (url === lastUrl) {
			return lastPromise;
		}
        lastUrl = url;
        lastPromise = loadImage(clut.root + url).then(image => getImageData(image));

        return lastPromise;
	}
};

export default clut;
