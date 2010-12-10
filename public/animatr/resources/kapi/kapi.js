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
		this[dim] = this.style[dim].replace(/px/gi, '') || this._params[dim];
	}
	
	return {
		init: function(canvas, params){
			var style, kapi, p;
			
			// Augment the canvas element...
			canvas.kapi = this;
			
			this._params = params || {};
			this.el = canvas;
			this.ctx = canvas.getContext('2d');
			
			// Set some default property values
			this._params.fRate = this._params.fRate || 20;
			this._drawList = [];
			this._keyframes = {};
			this._keyFrameIds = [];
			this._animationDuration = 0;
			
			this._defaults = {
				fillColor : '#f0f'
			};
			
			this.state = {
				fCount : 0
			};
			
			
			for (style in this._params.styles){
				if (this._params.styles.hasOwnProperty(style)){
					this.el.style[style] = this._params.styles[style];
				}
			}
			
			// The height and width of the canvas draw area do not sync
			// up with the CSS height/width values, so set those manually here
			this._params.styles.height && setDimensionVal.call(this.el, 'height');
			this._params.styles.width && setDimensionVal.call(this.el, 'width');
			
			return canvas;
		},
		
		getVersion: function(){
			return version;
		},
		
		start: function(){
			this.update();
		},
		
		stop: function(){
			clearTimeout(this._updateHandle);
		},
		
		update: function(){
			var self = this;
			
			this.state.fCount++;
			
			this._updateHandle = setTimeout(function(){
				self.ctx.clearRect(0, 0, self.el.width, self.el.height);
				self._update();
				self.update();
			}, 1000 / this._params.fRate);
			
			return this._updateHandle;
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
		
		// Sort the keyframe properties numerically.
		_sortKeyframes: function(){
			var _keyframes = {}, 
				arr = [],
				prop,
				i;
			
			for (prop in this._keyframes){
				arr.push(parseInt(prop, 10));
			}
			
			// Sort and update the internal list of keyframe IDs
			this._keyFrameIds = arr.sort(function(a, b){
				return a - b;
			});
			
			// Store the ordered keyframes into a temporary object
			for (i = 0; i < arr.length; i++){
				_keyframes[arr[i] + ''] = this._keyframes[arr[i]];
			}
			
			// Set the contents of the interal _keyframes object to that of the ordered temporary oject
			this._keyframes = _keyframes;
		},
		
		_keyframize: function(implementation){
			var self = this;
			
			// TODO:  keyframe() blows up if given a keyframeId with a string type.
			// It should accept strings.
			implementation.keyframe = function(keyframeId, stateObj){
				if (typeof self._keyframes[keyframeId] == 'undefined'){
					self._keyframes[keyframeId] = [];
				}
				
				self._keyframes[keyframeId].push(stateObj);
				self._sortKeyframes();
				
				// Calculate and update the number of seconds this animation will run for
				self._animationDuration = 
					self._keyFrameIds[self._keyFrameIds.length - 1] / self._params.fRate;
				
				return implementation;
			};
			
			return implementation;
		},
		
		circle: function(params){
			var self = this,
				ctx = params.context || this.ctx,
				
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