
import { loadImage } from "../modules/image-helpers";

export class File {
	constructor(opt) {
		this._id = opt._id;
		this.scale = opt.scale || 1;
		this.path = opt.path;

		this.loadImage();
	}

	async loadImage() {
		let img = await loadImage(this.path);
		this.img = img;
		this.oW = img.width;
		this.oH = img.height;
		this.w = this.oW * this.scale;
		this.h = this.oH * this.scale;

		Files.select(this._id);
		//Projector.render();
	}
}
