(function (Popcorn) {
   Popcorn.plugin( "skip", {
       // Define a manifest for the butter authoring tool to use
       manifest: {
         // Plugin meta data
         // will be used in the butter ui
         about:{
           name: "Skip Segment"
         },
         // Object representation of the plugin options
         // a form will be constructed against this object
         options:{
           start : {elem:'input', type:'text', label:'Skip From'},
           end : {elem:'input', type:'text', label:'To'},
         }
       },
       start: function( event, options ){
           this.currentTime(options.end);
       },
   });
})(Popcorn);