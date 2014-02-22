(function (Popcorn) {
   Popcorn.plugin( "blank", (function(){
       var css    = '.popcorn-plugin-blank { visibility: hidden; } video.popcorn-plugin-blank::-webkit-media-controls { visibility: visible; border: solid white 1px; box-shadow: 0px 0px 2px 2px black; background-color: black; } video.popcorn-plugin-blank::-webkit-media-controls:before { color: white; content: "Content customized for BYU"; font-weight: bold; }',
           style  = document.createElement('style');

       style.innerHTML = css;
       document.head.appendChild(style);

       return {
            // Define a manifest for the butter authoring tool to use
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Blank"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text', label:'Blank From'},
                    end : {elem:'input', type:'text', label:'To'},
                    target : {hidden: true}
                }
            },
            _setup: function( options ){
            },

            start: function( event, options ){
                this.media.className += ' popcorn-plugin-blank';

                // if this is not a video, we can't guarantee it will work. Just hide it.
                if(this.media.tagName != "VIDEO") {
                    this.media.style.display = 'none';
                }
            },

            end: function( event, options ){
                this.media.className = this.media.className.replace( /\bpopcorn-plugin-blank\b/g, '');

                if(this.media.tagName != "VIDEO") {
                    this.media.style.display = '';
                }
            },
                    
            _teardown: function( options ){
            }
       }
   })());
})(Popcorn);
