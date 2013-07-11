/**
 * Interactive plugin
 * @TODO: documentation, etc.
 */
(function (Popcorn) {
   Popcorn.plugin( "interactive", (function(){
       return {
            _setup: function( options ){
                var el = document.createElement('el'),
                    p = document.createElement('p'),
                    input = document.createElement('textarea'),
                    txt = document.createTextNode(options.text);

                el.className = 'popcorn-plugin-interactive';
                el.style.display = 'none';
                el.appendChild(p);
                el.appendChild(input);

                p.appendChild(txt);

                options._el = el;
                Popcorn.dom.find(options.target).appendChild(el);
            },
            start: function( event, options ){
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
