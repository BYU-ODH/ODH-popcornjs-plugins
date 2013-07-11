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
   Popcorn.plugin( "youtube", ( function() {
       var api = "https://www.googleapis.com/youtube/v3/search";

       return {
           _setup: function( options ) {
               var url = api + '?maxResults=5&part=snippet&q=' + options.item,
                   el = document.createElement('div'),
                   txt = document.createTextNode('Loading...'),
                   pop = this;

               if(options.key) { url += "&key=" + options.key; }

               el.className = 'popcorn-plugin-youtube';
               options._el = el;
               el.appendChild(txt);
               el.style.display = 'none';
               Popcorn.dom.find(options.target).appendChild(el);

               Popcorn.getJSONP( url, function populateData( data ) {
                   if(options._el) { // does the element still exist? If not, don't do anything
                       el.removeChild(txt);

                       var list = document.createElement('ul');

                       /**@TODO: not sure what to populate this with yet **/
                       for(var i = 0; i<data.items.length; i++) {
                           var item = document.createElement('li'),
                               img = document.createElement('img'),
                               link = document.createElement('a');

                           link.href = 'http://www.youtube.com/watch?v=' + data.items[i].id.videoId;
                           link.target = '_blank';
                           link.onclick = function() {
                               pop.pause();
                           };
                           img.src = data.items[i].snippet.thumbnails['default'].url;
                           
                           link.appendChild(img);
                           item.appendChild(link);
                           list.appendChild(item);
                       };
                       el.appendChild(list);
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
