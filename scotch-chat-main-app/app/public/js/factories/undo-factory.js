app.factory("UndoRedo", function(){
	var picCache = [];
	
	return {
		Redo : function(img){
			if(picCache.length > 10){
				picCache.shift();
			}
			picCache.push(img);
		}
	}
	
	
})