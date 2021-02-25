
import { processImage } from "./image-processing";

let clut;

let commands = {
    setClut: (clut_) => {
        clut = clut_;
    },
    processImage: (imageData, slice, options) => {
        //options.clut = clut;
        processImage(imageData, slice, options);
        self.postMessage(imageData, [imageData.data.buffer]);
    }
};

self.onmessage = function(event) {
    commands[event.data.command].apply(self, event.data.arguments);
};
