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
 *  @todo When zero-duration events are supported, remove this
 */
(function (Popcorn) {
   Popcorn.plugin( "modal", function(){
       
       var _container = undefined;
       var _mask = undefined;
       var close = function() {
           _mask.style.display = 'none';
           _container.style.display = 'none';
       };
       
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
                options._seen = false;

                _mask = document.createElement('div');
                _mask.className = 'popcorn-modal-mask';
                with(_mask.style) {
                        zIndex = 1000;
                        width = '100%';
                        height = '100%';
                        opacity = 0.5;
                        position = 'fixed';
                        top = 0;
                        left = 0;
                        backgroundColor = "#000";
                        display = 'none';
                }

                document.body.appendChild(_mask);

                var container = document.createElement('div');
                container.className = 'popcorn-modal-holder';
                with(container.style) {
                        padding = '10px';
                        zIndex = 1001;
                        backgroundColor = '#FFF';
                        position = 'fixed';
                        top = '50%';
                        left = '50%';
                        display = 'none';
//                        minWidth = '100px';
//                        minHeight = '100px';
                        padding = '10px';
                        boxShadow = '3px 3px black';
                        setTimeout(function(){
                            marginTop = '-' + (container.offsetHeight/2) + 'px';
                            marginLeft = '-' + (container.offsetWidth/2) + 'px';
                        })
                }
                
                var exit = document.createElement('div');
                
                exit.className = 'popcorn-modal-close';
                exit.innerHTML = 'x';
                with(exit.style) {
                    display = 'block';
                    cursor = 'pointer';
                    textAlign = 'right';
                    margin = '0px 0px 10px 0px';
                    top = 0;
                    right = 0;
                }
                
                var text = document.createElement('div');
                text.className = 'popcorn-modal-contents';
                text.innerHTML = options.text;
                container.appendChild(exit);
                container.appendChild(text);
                document.body.appendChild(container);

                _container = container;

                _mask.addEventListener('click', close);
                exit.addEventListener('click',close);
            },
            start: function( event, options ){
                if(options.showOnce && options._seen) {
                    return;
                }

                options._seen = true;
                _mask.style.display = 'block';
                _container.style.display = 'block';
                this.pause();
            },
            end: function( event, options ){
                // do nothing
            },
            _tearDown: function( options ){
                document.body.removeChild(_mask);
                document.body.removeChild(_container);
            }
       }
   }());
})(Popcorn);