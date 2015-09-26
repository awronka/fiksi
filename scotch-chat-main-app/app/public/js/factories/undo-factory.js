app.factory("UndoRedo", function(){
	var picCache = [];
	// picCache close over array to save image values
	return {
		saveImageState : function(img){
			// console.log(img);
			picCache.push(img)
			console.log(picCache)
			if(picCache.length > 10){
				picCache.shift();
			}
		},
		redo : function(img){
			
			picCache.push(img);
		},
		undo : function(){
			if(!picCache.length) return;
			console.log(picCache[picCache.legnth-1])
			return picCache[picCache.length-2];
		}
	}
	
	
})