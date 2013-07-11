/**
 * Example:
 * pop.freebase({
 *      start: 10,
 *      end: 15,
 *      target: "elementID",
 *      key: "YOURFREEBASEAPIKEY",
 *      item: "/m/somethingorother"
 * });
 */
(function ( Popcorn ) {
   Popcorn.plugin( "freebase", ( function() {
       var api = "https://www.googleapis.com/freebase/v1/topic/";

       return {
           _setup: function( options ) {
               var url = api + options.item + "?key=" + options.key,
                   el = document.createElement('p'),
                   txt = document.createTextNode('Loading...');

               options._el = el;
               el.appendChild(txt);
               el.style.display = 'none';
               Popcorn.dom.find(options.target).appendChild(el);

               Popcorn.getJSONP( url, function populateData( data ) {
                   if(options._el) { // does the element still exist? If not, don't do anything
                       el.removeChild(txt);
                       /**@TODO: not sure what to populate this with yet, so just use first element **/
                       for(var i in data.property) {
                           if(data.property.hasOwnProperty(i) {
                               var newtxt = document.createTextNode(i.values[0].text);
                               el.appendChild(newtxt);
                               break;
                           }
                       };
                   };
               });
           },
           start: function( event, options ) {
               options._el.style.display = 'block';              
           },
           end: function( event, options ) {
               options._el.style.display = 'none';              
           },        
           _teardown: function( options ) {
               options._el.parentNode.removeChild(options._el);
               delete options._el;
           }
       };    
   })());
})( Popcorn );
