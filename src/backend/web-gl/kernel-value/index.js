const { utils } = require('../../../utils');
const { Input } = require('../../../input');
const { KernelValue } = require('../../kernel-Value');

class WebGLKernelValue extends KernelValue {
  /**
   *
   * @param {IWebGLKernerlValueSettings} settings
   */
  constructor(value, settings) {
    super(value, settings);
    this.dimensionsId = null;
    this.sizeId = null;
    this.onRequestTexture = settings.onRequestTexture;
  }

  requestTexture() {
    this.dimensionsId = this.id + 'Dim';
    this.sizeId = this.id + 'Size';
    this.texture = this.onRequestTexture();
  }
  /**
   * @desc Adds kernel parameters to the Value Texture,
   * binding it to the context, etc.
   *
   * @param {Array|Float32Array|Uint16Array} value - The actual Value supplied to the kernel
   * @param {Number} length - the expected total length of the output array
   * @param {Object} [Type]
   * @returns {Float32Array|Uint16Array|Uint8Array} flattened array to transfer
   */
  formatArrayTransfer(value, length, Type) {
    if (utils.isArray(value[0]) || this.optimizeFloatMemory) {
      // not already flat
      const valuesFlat = new Float32Array(length);
      utils.flattenTo(value, valuesFlat);
      return valuesFlat;
    } else {
      switch (value.constructor) {
        case Uint8Array:
        case Int8Array:
        case Uint16Array:
        case Int16Array:
        case Float32Array:
        case Int32Array:
          const valuesFlat = new(Type || value.constructor)(length);
          utils.flattenTo(value, valuesFlat);
          return valuesFlat;
        default:
          {
            const valuesFlat = new Float32Array(length);
            utils.flattenTo(value, valuesFlat);
            return valuesFlat;
          }
      }
    }
  }

  /**
   * bit storage ratio of source to target 'buffer', i.e. if 8bit array -> 32bit tex = 4
   * @param value
   * @returns {number}
   */
  getBitRatio(value) {
    if (Array.isArray(value[0])) {
      return this.getBitRatio(value[0]);
    } else if (value.constructor === Input) {
      return this.getBitRatio(value.value);
    }
    switch (value.constructor) {
      case Uint8Array:
      case Int8Array:
        return 1;
      case Uint16Array:
      case Int16Array:
        return 2;
      case Float32Array:
      case Int32Array:
      default:
        return 4;
    }
  }
}

module.exports = {
  WebGLKernelValue
};