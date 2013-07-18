/**
 * Example:
 * pop["freebase-search"]({
 *      start: 10,
 *      end: 15,
 *      target: "elementID",
 *      key: "YOURFREEBASEAPIKEY",
 *      item: "/m/somethingorother"
 * });
 */
(function ( Popcorn ) {
   Popcorn.plugin( "freebase-search", ( function() {
       var api = "https://www.googleapis.com/freebase/v1/topic";
       return {
           _setup: function( options ) {
               var url = api + options.item,
                   el = document.createElement('div'),
                   txt = document.createTextNode('Loading...');

               if(options.key) { url += "?key=" + options.key; }

               options._el = el;
               el.appendChild(txt);
               el.style.display = 'none';
               Popcorn.dom.find(options.target).appendChild(el);

               Popcorn.getJSONP( url, function populateData( data ) {
                   if(options._el) { // does the element still exist? If not, don't do anything
                       el.removeChild(txt);
                       var container = document.createElement('div');
                       container.className = 'freebase-note';
                     
                       var header = document.createElement("h3");
                       var body = document.createElement("p");               
                       header.innerHTML="<img src='http://www.freebase.com/static/138a.lib.www.tags.svn.freebase-site.googlecode.dev/template/img/freebase-logo.png'/> "+data.property["/type/object/name"].values[0].text+"<br/>";
                       body.innerHTML=data.property["/common/topic/description"].values[0].value;
                       container.appendChild(header);
                       container.appendChild(body);
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
