/**
 * Options:
 *  start
 *  end
 *  text mixed The text to display in the modal
 *  showOnce boolean Whether or not to display this modal more than once a page-refresh
 *  
 * Internal Properties:
 *  _container The DOM element that is displayed as our modal window
 *  _mask The DOM element used to dim the background
 *  _seen Whether or not the user has seen this modal or not
 */
(function (Popcorn) {
   Popcorn.plugin( "modal", function(){
       
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
                    start : {elem:'input', type:'text', label:'Skip From'},
                    end : {elem:'input', type:'text', label:'To'},
                    text: {elem: 'textarea', label: 'text'},
                    showOnce : {elem: 'input', type: 'checkbox', label: 'Show only once'}
                }
            },
            _setup: function( options ){
                options._seen = false;

                var mask = document.createElement('div');
                with(mask.style) {
                        zIndex = 1000;
                        position = 'absolute';
                        width = '100%';
                        height = '100%';
                        opacity = 0.5;
                        position = 'fixed';
                        top = 0;
                        left = 0;
                        backgroundColor = "#000";
                        display = 'none';   
                }

                options._mask = mask;
                document.body.appendChild(mask);

                var container = document.createElement('div');
                with(container.style) {
                        padding = '10px';
                        zIndex = 1001;
                        backgroundColor = '#FFF';
                        position = 'fixed';
                        top = '50%';
                        left = '50%';
                        display = 'none';
                        setTimeout(function(){
                            marginTop = '-' + (container.offsetHeight/2) + 'px';
                            marginLeft = '-' + (container.offsetWidth/2) + 'px';
                        })
                }
                container.innerHTML = options.text;
                document.body.appendChild(container);

                options._container = container;

                mask.addEventListener('click', function(){
                    options._mask.style.display = 'none';
                    options._container.style.display = 'none';
                });
            },
            start: function( event, options ){
                if(options.showOnce && options._seen) {
                    return;
                }

                options._seen = true;
                options._mask.style.display = 'block';
                options._container.style.display = 'block';
                this.pause();
            },
            end: function( event, options ){
                options._mask.style.display = 'none';
                options._container.style.display = 'none';
            },
            _tearDown: function( options ){
                document.body.removeChild(options._mask);
                document.body.removeChild(options._container);
            }
       }
   }());
})(Popcorn);