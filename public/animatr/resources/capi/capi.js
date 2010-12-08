/*  CAPI - Canvas API
 *  jeremyckahn@gmail.com
 * 
 * A lightweight wrapper and runtime for the HTML 5 cavnvas.
 */


// CAPI works by augmenting the Canvas element on the DOM.
function capi(canvas, params){
	
	var version = '0.1';
	
	return {
		init: function(canvas, params){
			var style, capi, p;
			
			capi = canvas.capi = this;
			capi.params = this.params = params || {};
			
			// Set some default values
			capi.params.fRate = capi.params.fRate || 20;
			
			capi.state = this.state = {
				fCount: 0
			};
			
			for (style in capi.params.styles){
				if (capi.params.styles.hasOwnProperty(style)){
					canvas.style[style] = capi.params.styles[style];
				}
			}
			
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
				self._update();
				self.update();
			}, 1000 / this.params.fRate);
			
			return this.updateHandle;
		},
		
		_update: function(){
			
		}
	}.init(canvas, params);
}