require('raf/polyfill');
const fs = require('fs');
const getPixels = require('get-pixels');
const gl = require('gl');
const { PNG } = require('pngjs');
const { Main } = require('./elm');
const canvases = [];

global.Image = function Image () {
  let load = () => {};
  let error = () => {};
  const img = {
    set onload(cb) {
      load = cb;
    },
    set onerror(cb) {
      error = cb;
    },
    set src(val) {
      getPixels(val, (err, pixels) => {
        if (err) {
          error(err);
        } else {
          this.width = pixels.shape[0];
          this.height = pixels.shape[1];
          this.channels = pixels.shape[2];
          this.data = pixels.data;
          load();
        }
      })
    }
  }
  return img;
}

global.document = {
  createElement: () => {
    const canvas = {
      width: 300,
      height: 300,
      gl: undefined,
      style: {},
      setAttribute: function (key, value) {
        this[key] = value;
        if (this.gl) {
          this.resize(this.width, this.height);
        }
      },
      getContext: function (_, attributes) {
        if (!this.gl) {
          this.gl = gl(this.width, this.height, attributes);
          this.resize = this.gl.getExtension('STACKGL_resize_drawingbuffer').resize;
        }
        return this.gl;
      }
    }
    canvases.push(canvas);
    return canvas;
  }
}

Main.embed({ appendChild: () => {} });

let seq = 0;
setInterval(() => {
  canvases.forEach(({ width, height, gl }, number) => {
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const png = new PNG({ width, height });
    pixels.forEach((pixel, i) => {
      const y = (i / (4 * width)) | 0;
      const x = i % (4 * width);
      const flipI = (height - y - 1) * (4 * width) + x;
      png.data[flipI] = pixel;
    })
    png.pack().pipe(fs.createWriteStream(`${number}-${seq}.png`));
    seq++;
  })
}, 1000)
