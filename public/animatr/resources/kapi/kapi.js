/*  Kapi - Keyframe API (for canvas)
 *  jeremyckahn@gmail.com
 * 
 * A lightweight wrapper and keyframe interface for the HTML 5 canvas.
 */


// kapi works by augmenting the Canvas element on the DOM.
function kapi(canvas, params){
	
	var version = '0.1';
	
	// Strip the 'px' from a style string and add it to the element directly
	function setDimensionVal(dim){
		this[dim] = this.style[dim].replace(/px/gi, '') || this.params[dim];
	}
	
	return {
		init: function(canvas, params){
			var style, kapi, p;
			
			// Augment the canvas element...
			canvas.kapi = this;
			
			this.params = params || {};
			this.el = canvas;
			this.ctx = canvas.getContext('2d');
			
			// Set some default values
			this.params.fRate = this.params.fRate || 20;
			this._drawList = [];
			this._defaults = {
				fillColor : '#f0f'
			};
			
			this.state = {
				fCount: 0
			};
			
			this._keyframes = [];
			
			for (style in this.params.styles){
				if (this.params.styles.hasOwnProperty(style)){
					this.el.style[style] = this.params.styles[style];
				}
			}
			
			// The height and width of the canvas draw area do not sync
			// up with the CSS height/width values, so set those manually here
			this.params.styles.height && setDimensionVal.call(this.el, 'height');
			this.params.styles.width && setDimensionVal.call(this.el, 'width');
			
			return canvas;
		},
		
		getVersion: function(){
			return version;
		},
		
		start: function(){
			this.update();
		},
		
		stop: function(){
			clearTimeout(this.updateHandle);
		},
		
		update: function(){
			var self = this;
			
			this.state.fCount++;
			
			this.updateHandle = setTimeout(function(){
				self.ctx.clearRect(0, 0, self.el.width, self.el.height);
				self._update();
				self.update();
			}, 1000 / this.params.fRate);
			
			return this.updateHandle;
		},
		
		_update: function(){
			var i;
			
			for (i = 0; i < this._drawList.length; i++){
				this._drawList[i].call(this, this.ctx);
			}
		},
		
		pop: function(){
			return this._drawList.pop();
		},
		
		push: function(func){
			return this._drawList.push(func);
		},
		
		_keyframize: function(implementation){
			var self = this;
			
			// TODO:  keyframe() blows up if given a keyframeId with a string type.
			// It should accept strings.
			implementation.keyframe = function(keyframeId, state){
				
			};
			
			return implementation;
		},
		
		circle: function(params){
			var self = this,
				ctx = this.ctx,
				// TODO:  _circle's implementation is that of a bitmap.
				// It should be an SVG.
				_circle = function(){
					ctx.beginPath();
					ctx.arc(
						params.x || 0,
						params.y || 0,
						params.radius || 0,
						0,
						Math.PI*2,
						true
						);
					ctx.fillStyle = params.color || self._defaults.fillColor;
					ctx.fill();
					ctx.closePath();
				};
			
			return this._keyframize(_circle);
		}
	}.init(canvas, params);
}