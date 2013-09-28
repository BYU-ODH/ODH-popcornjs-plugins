(function (Popcorn) {
   Popcorn.plugin( "mutePlugin", (function(){
   return {
       manifest: {
           about:{
               name: "Mute Plugin"
           },
           options:{
               start : {elem:'input', type:'text', label:'Begin'},
               end : {elem:'input', type:'text', label:'End'}
           }
       },
       _setup: function(options){
        options.muteOnChange = function(){
            if(!this.muted()){
                var time = this.currentTime();
                if((time > options.start) && (time < options.end)) {
                    this.mute();
                }
            }
        };
        this.on("volumechange", options.muteOnChange);
       },
       start: function(event,options){
        options.was_muted = this.muted();
        this.mute();
       },
       end: function(event,options){
        if(!options.was_muted){
            this.unmute();
        }
       },        
       _teardown: function(options){
        this.off("volumechange", options.muteOnChange);
       }
   };    
       
   })());
})(Popcorn);
