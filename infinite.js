/**
 * Module dependencies.
 */

var events = require('component-events')
  , Emitter = require('component-emitter')
  , bind = require('component-bind')
  , throttle = require('matthewmueller-throttle');

/**
 * Expose `Infinite`.
 */

module.exports = Infinite;

/**
 * Initialize a new lazy loading scrolling list.
 *
 * @param {Object} el The DOMElement to listen of for scroll events.
 * @param {Function} loadCallback
 * @param {Number} margin Number of pixels to pre-trigger load.
 * @api public
 */

function Infinite(el, loadCallback, margin) {
  if(!(this instanceof Infinite))
    return new Infinite(el, loadCallback, margin);

  this.el = el;
  if(typeof loadCallback == "function")
    this.on("load", bind(this.el, loadCallback));
  
  this.margin = typeof margin == "number" ? margin : 0;
  this.iteration = 0;
  this.paused = false;

  // listen on scroll event
  this.bind(this.el);
}

// Inherit from Emitter
Emitter(Infinite.prototype);

/**
 * Bind to a DOMElement.
 *
 * @param {Object} el
 * @api public
 */

Infinite.prototype.bind = function(el) {
  if(el) this.el = el;

  this.unbind();
  this.events = events(this.el, this);

  if(this.el.scrollHeight > this.el.clientHeight) this.events.bind("scroll");
  else this.events.bind("mousewheel");

  this.resume();
};

/**
 * Unbind from the DOMElement.
 *
 * @api public
 */

Infinite.prototype.unbind = function() {
  this.pause();
  if(this.events) this.events.unbind();
};

/**
 * Handle a scroll event.
 *
 * @param {Object} event
 * @api public
 */

Infinite.prototype.onscroll = function() {
  if(!this.paused && this.el.scrollHeight <= this.el.scrollTop + this.el.clientHeight + this.margin)
    this.load();
};

/**
 * Handle a mousewheel event.
 *
 * @param {Object} event
 * @api public
 */

Infinite.prototype.onmousewheel = function(e) {
  if(!this.paused) {
    if(e.wheelDelta > 0) this.load(-1);
    else this.load(1);
  }
};

/**
 * Issue a debounced load.
 *
 * @api public
 */

Infinite.prototype.load = throttle(function(i) {
  var i = typeof i == "number" ? i : 1;
  this.iteration = this.iteration + i;

  this.emit("load", this.iteration, i);
}, 100);

/**
 * Pause emitting `load` events.
 *
 * @api public
 */

Infinite.prototype.pause = function() {
  this.paused = true;
  this.emit("pause");
};

/**
 * Resume emitting `load` events.
 *
 * @api public
 */

Infinite.prototype.resume = function() {
  this.paused = false;
  this.emit("resume");
};