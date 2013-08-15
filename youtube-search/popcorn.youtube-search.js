/**
 * Example:
 * pop['popcorn-plugin-youtube']({
 *      start: 10,
 *      end: 15,
 *      target: "elementID",
 *      results: 4, // how many videos to return, default is 4 
 *      key: "YOURYOUTUBEAPIKEY",
 *      item: "charlie bit my finger",
 *      text: "any description you want to give to this collection of videos"
 * });
 */
(function ( Popcorn ) {
   Popcorn.plugin( "youtube-search", ( function() {
       var api = "https://www.googleapis.com/youtube/v3/search";
       var defaultVideoCount = 4;

       return {
            // Define a manifest for the butter authoring tool to use
            manifest: {
                // Plugin meta data
                // will be used in the butter ui
                about:{
                    name: "Youtube Search"
                },
                // Object representation of the plugin options
                // a form will be constructed against this object
                options:{
                    start : {elem:'input', type:'text'},
                    end : {elem:'input', type:'text'},
                    item : {elem: 'input', label: 'Search Query', type: 'text'},
                    results : {elem: 'input', type: 'number', label: 'Results', "default": 4, units: 'videos'},
                    text : {elem: 'textarea', label: 'Description'}
                }
            },
           _setup: function( options ) {
               options.results = options.results || defaultVideoCount;

               var url = api + '?maxResults=' + options.results + '&part=snippet&q=' + options.item,
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
                       if(data.error) {
                           var err = document.createTextNode('There was an error pulling data from Youtube');
                           el.removeChild(txt);
                           el.appendChild(txt);
                           return;
                       }
                       el.removeChild(txt);
                       var container = document.createElement('div');
                       container.className = 'youtube-note';
                       var header = document.createElement('h3');
                       header.innerHTML="<img src=\"https://developers.google.com/youtube/images/YouTube_logo_standard_white.png\"/> "
                           + (options.text || '');
                       container.appendChild(header);
                       var list = document.createElement('ul');
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
                       container.appendChild(list);
                       el.appendChild(container);
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
