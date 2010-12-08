/*  CAPI - Canvas API
 *  jeremyckahn@gmail.com
 * 
 * A lightweight wrapper and runtime for the HTML 5 canvas.
 */


// CAPI works by augmenting the Canvas element on the DOM.
function capi(canvas, params){
	
	var version = '0.1';
	
	// Strip the 'px' from a style string and add it to the element directly
	function setDimensionVal(dim){
		this[dim] = this.style[dim].replace(/px/gi, '') || this.params[dim];
	}
	
	return {
		init: function(canvas, params){
			var style, capi, p;
			
			capi = canvas.capi = this;
			capi.params = this.params = params || {};
			capi.el = canvas;
			capi.ctx = canvas.getContext('2d');
			
			// Set some default values
			capi.params.fRate = capi.params.fRate || 20;
			capi._drawList = [];
			
			capi.state = this.state = {
				fCount: 0
			};
			
			for (style in capi.params.styles){
				if (capi.params.styles.hasOwnProperty(style)){
					canvas.style[style] = capi.params.styles[style];
				}
			}
			
			// The height and width of the canvas draw area do not sync
			// up with the CSS height/width values, so set those manually here
			capi.params.styles.height && setDimensionVal.call(this.el, 'height');
			capi.params.styles.width && setDimensionVal.call(this.el, 'width');
			
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
		}
	}.init(canvas, params);
}