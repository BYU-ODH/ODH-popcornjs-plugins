/**
 * Options:
 *  start
 *  text mixed The text to display in the modal
 *  showOnce boolean Whether or not to display this modal more than once a page-refresh
 *  
 * Internal Properties:
 *  _container The DOM element that is displayed as our modal window
 *  _mask The DOM element used to dim the background
 *  _seen Whether or not the user has seen this modal or not
 *  
 *  @todo Handle stacking of modals, etc.
 */
(function (Popcorn) {
   Popcorn.plugin( "modal", function(){
       
       var close = function( options ) {
           options._mask.style.display = 'none';
           options._container.style.display = 'none';
       };
       
       var reposition = function( container ) {
            if(container.style.display == 'none') {
                return;
            }
            container.style.marginTop = '-' + (container.offsetHeight/2) + 'px';
            container.style.marginLeft = '-' + (container.offsetWidth/2) + 'px';
            container.style.top = '50%';
            container.style.left = '50%';
       }
       
       return {
            // Define a manifest for the butter authoring tool to use
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Display Modal Window"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text', label:'Display at'},
                    end : {elem:'input', type:'text', label:'To'}, // this is unneeded
                    showOnce : {elem: 'input', type: 'checkbox', label: 'Show only once'},
                    text: {elem: 'textarea', label: 'text'},
                    target : {hidden: true}
                }
            },
            _setup: function( options ){
                options.toString = function() {
                    return 'Modal: ' + options.text;
                }

                options._seen = false;

                options._mask = document.createElement('div');
                options._mask.className = 'popcorn-modal-mask';
                options._mask.style.zIndex = 1000;
                options._mask.style.width = '100%';
                options._mask.style.height = '100%';
                options._mask.style.opacity = 0.5;
                options._mask.style.position = 'fixed';
                options._mask.style.top = 0;
                options._mask.style.left = 0;
                options._mask.style.backgroundColor = "#000";
                options._mask.style.display = 'none';

                document.body.appendChild(options._mask);

                var container = document.createElement('div');
                container.className = 'popcorn-modal-holder';
                container.style.padding = '10px';
                container.style.zIndex = 1001;
                container.style.backgroundColor = '#FFF';
                container.style.position = 'fixed';
                container.style.display = 'none';
                container.style.padding = '10px';
                container.style.boxShadow = '3px 3px black';
                
                var exit = document.createElement('div');
                
                exit.className = 'popcorn-modal-close';
                exit.innerHTML = 'x';
                exit.style.display = 'block';
                exit.style.cursor = 'pointer';
                exit.style.textAlign = 'right';
                exit.style.margin = '0px 0px 10px 0px';
                exit.style.top = 0;
                exit.style.right = 0;
                
                var text = document.createElement('div');
                text.className = 'popcorn-modal-contents';
                text.innerHTML = options.text;
                container.appendChild(exit);
                container.appendChild(text);
                document.body.appendChild(container);

                options._container = container;
                options._reposition = function() {
                    return reposition(options._container);
                }

                options._mask.addEventListener('click', function(){close(options)});
                exit.addEventListener('click', function(){close(options)});
                window.addEventListener('resize', options._reposition);
            },
            start: function( event, options ){
                if(options.showOnce && options._seen) {
                    return;
                }

                options._seen = true;
                options._mask.style.display = 'block';
                options._container.style.display = 'block';
                options._reposition();
                this.pause();
            },
            end: function( event, options ){
                // do nothing
            },
            _teardown: function( options ){
                document.body.removeChild(options._mask);
                document.body.removeChild(options._container);
                window.removeEventListener('resize', options._reposition);
            }
       }
   }());
})(Popcorn);
