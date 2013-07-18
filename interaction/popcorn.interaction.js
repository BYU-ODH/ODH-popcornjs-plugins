/**
 * Interactive plugin
 * @TODO: documentation, etc.
 */
(function (Popcorn) {
   Popcorn.plugin( "interaction", (function(){
       return {
            // Define a manifest for the butter authoring tool to use
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Interaction"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text', label:'Start'},
                    end : {elem:'input', type:'text', label:'End'},
                    text : {elem: 'textarea', label: 'Prompt'}
                }
            },
            _setup: function( options ){
                var el = document.createElement('el'),
                    p = document.createElement('p'),
                    input = document.createElement('textarea'),
                    txt = document.createTextNode(options.text);

                el.className = 'popcorn-plugin-interaction';
                el.style.display = 'none';
                el.appendChild(p);
                el.appendChild(input);

                p.appendChild(txt);

                options._el = el;
                Popcorn.dom.find(options.target).appendChild(el);
            },
            start: function( event, options ){
                this.pause();
                options._el.style.display = 'block';
            },
            end: function( event, options ){
                options._el.style.display = 'none';
            },
            _tearDown: function( options ){
                options._el.parentNode.removeChild(options._el);
            }
       }
   })());
})(Popcorn);
