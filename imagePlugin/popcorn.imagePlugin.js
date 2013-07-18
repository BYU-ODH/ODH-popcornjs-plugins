(function (Popcorn) {
   Popcorn.plugin( "imagePlugin", (function(){

       return {
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Image Plugin"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text', label:'Show Image From'},
                    end : {elem:'input', type:'text', label:'To'},
                    src : {elem: 'input', label: 'Image URL'}
                }
            },
            _setup: function( options ){
                var img = document.createElement('img');

                img.class = 'popcorn-plugin-image';
                img.style.display = 'none';
                img.src = options.src;
                options._img = img;
                Popcorn.dom.find(options.target).appendChild(img);
            },
            start: function( event, options ){
                options._img.style.display = '';
            },
            end: function( event, options ){
                options._img.style.display = 'none';
            },
            _tearDown: function( options ){
                options._p.parentNode.removeChild(options._img);
            }
       };
   })());
})(Popcorn);
