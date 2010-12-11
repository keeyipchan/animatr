/*  Kapi - Keyframe API (for canvas)
 *  jeremyckahn@gmail.com
 * 
 * A lightweight wrapper and keyframe interface for the HTML 5 canvas.
 */


// kapi works by augmenting the Canvas element on the DOM.
function kapi(canvas, params){
	
	var version = '0.1',
		defaults = {
			fillColor : '#f0f',
			fRate : 20
		};
	
	/* Define some useful methods that are private to Kapi. */
	
	// Strip the 'px' from a style string and add it to the element directly
	// Meant to be called with Function.call()
	function setDimensionVal(dim){
		this[dim] = this.style[dim].replace(/px/gi, '') || this._params[dim];
	}
	
	function now(){
		return + new Date();
	}
	
	// Adapted from the book, "JavaScript Patterns" by Stoyan Stefanov
	function extend(child, parent, doOverwrite){
		var i, 
			toStr = Object.prototype.toString,
			astr = '[object Array]';
			
		child = child || {};
		
		for (i in parent){
			if (parent.hasOwnProperty(i)){
				if (typeof parent[i] === 'object'){
					if (!child[i] || doOverwrite){
						child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
					}
					extend(child[i], parent[i]);
				} else {
					if (!child[i] || doOverwrite){
						child[i] = parent[i];
					}
				}
			}
		}
	}
	
	return {
		// init() is called immediately after this object is defined
		init: function(canvas, params){
			var style, kapi;
			
			// Augment the canvas element
			canvas.kapi = this;
			
			params = params || {};
			extend(params, defaults);
			this._params = params;
			this.el = canvas;
			this.ctx = canvas.getContext('2d');
			
			// Set some default property values
			//this._params.fRate = this._params.fRate || 20;
			this._drawList = [];
			this._keyframes = {};
			this._keyFrameIds = [];
			this._animationDuration = 0;
			
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
			if (this._params.styles){
				if (this._params.styles.height){
					setDimensionVal.call(this.el, 'height');
				}
				if (this._params.styles.width){
					setDimensionVal.call(this.el, 'width');
				}
			}
			
			return canvas;
		},
		
		getVersion: function(){
			return version;
		},
		
		start: function(){
			this._loopStartTime = this._startTime = now();
			this.update();
		},
		
		stop: function(){
			clearTimeout(this._updateHandle);
		},
		
		// Handle high-level frame management logic
		update: function(){
			var self = this;
			
			this.state.fCount++;
			
			this._updateHandle = setTimeout(function(){
				
				self._loopLength = now() - self._loopStartTime;
				
				// Start the loop over if need be.
				if (self._loopLength > self._animationDuration){
					self._loopStartTime = now();
					self._loopLength -= self._animationDuration;	
				}
				
				// Determine where we are in the loop
				self._loopPosition = self._loopLength / self._animationDuration;
				
				// Calculate the current frame of the loop
				self._currentFrame = parseInt(self._loopPosition * self._params.fRate, 10);
				
				self.ctx.clearRect(0, 0, self.el.width, self.el.height);
				self._update(self._currentFrame);
				self.update();
			}, 1000 / this._params.fRate);
			
			return this._updateHandle;
		},
		
		// Handle low-level drawing logic
		_update: function(currentFrame){
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
				if (this._keyframes.hasOwnProperty(prop)){
					arr.push(parseInt(prop, 10));
				}
			}
			
			// Sort and update the internal list of keyframe IDs
			this._keyFrameIds = arr.sort(function(a, b){
				return a - b;
			});
			
			// Store the ordered keyframes into a temporary object
			for (i = 0; i < arr.length; i++){
				_keyframes[arr[i] + ''] = this._keyframes[arr[i]];
			}
			
			// Set the contents of the internal _keyframes object to that of the ordered temporary object
			this._keyframes = _keyframes;
		},
		
		_keyframize: function(implementationObj){
			var self = this;
			
			// TODO:  keyframe() blows up if given a keyframeId that is a string.
			// It should accept strings.
			implementationObj.keyframe = function(keyframeId, stateObj){
				extend(stateObj, implementationObj.params);
				
				// Make really really sure the id is unique, if one is not provided
				if (typeof implementationObj.id === 'undefined'){
					implementationObj.id = implementationObj.params.id || implementationObj.params.name || parseInt(('' + Math.random()).substr(2), 10) + now();
				}
				
				// If this keyframe does not already exist, create it
				if (typeof self._keyframes[keyframeId] == 'undefined'){
					self._keyframes[keyframeId] = {};
				}
				
				// If this keyframe does not already have state info for this object, create it
				self._keyframes[keyframeId][implementationObj.id] = stateObj;
				
				self._updateKeyframes(implementationObj);
				
				// Calculate and update the number of seconds this animation will run for
				self._animationDuration = 
					1000 * (self._keyFrameIds[self._keyFrameIds.length - 1] / self._params.fRate);
				
				return implementationObj;
			};
			
			// Not all that useful, just some syntactical sugar.
			implementationObj.draw = function(){
				return implementationObj();
			};
			
			return implementationObj;
		},
		
		_updateKeyframes: function(implementationObj){
			this._sortKeyframes();
			this._normalizeObjectAcrossKeyframes(implementationObj.id);
		},
		
		_normalizeObjectAcrossKeyframes: function(keyframedObjId){
			var state, prevState;
			
			for (state in this._keyframes){
				if (this._keyframes.hasOwnProperty(state)){
					if (prevState){
						extend(
							this._keyframes[state][keyframedObjId],
							this._keyframes[prevState][keyframedObjId]);
					}
				
					prevState = state;
				}
			}
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
					ctx.fillStyle = params.color || self.params.fillColor;
					ctx.fill();
					ctx.closePath();
				};
				
				_circle.params = params;
			
			return this._keyframize(_circle);
		}
	}.init(canvas, params);
}