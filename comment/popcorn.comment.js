/**
 * Comment plugin
 * @TODO: documentation, etc.
 */
(function (Popcorn) {
   Popcorn.plugin( "comment", (function(){
       var _uid = 0;

       return {
            // Define a manifest for the butter authoring tool to use
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Comment"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text', label:'Skip From'},
                    end : {elem:'input', type:'text', label:'To'},
                    text : {elem: 'textarea', label: 'Text'}
                }
            },
            _setup: function( options ){
                var p = document.createElement('p');

                p.id = 'popcorn-comment-' + _uid++;
                p.style.display = 'none';
                p.innerHTML = options.text;
                options._p = p;
                Popcorn.dom.find(options.target).appendChild(p);
            },
            start: function( event, options ){
                options._p.style.display = 'block';
            },
            end: function( event, options ){
                options._p.style.display = 'none';
            },
            _tearDown: function( options ){
                options._p.parentNode.removeChild(options._p);
            }
       }
   })());
})(Popcorn);
