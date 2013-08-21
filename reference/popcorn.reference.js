/**
 * Popcorn Reference Plugin
 * 
 * Good for footnotes, vocabulary, etc.
 * 
 * Displays an item in a list that, when clicked, takes the user to the start time of this plugin.
 * Between the start and end values, items are displayed in the target element along with any details provided.
 * 
 * After clicking on an element to display it, the video should pause immediately when the 'end' time is reached.
 * If the elements are not clicked to direct the user to their time, the video plays without stopping
 * 
 * Options:
 *  start - when to start displaying the item
 *  end - when to stop displaying the item
 *  item - the item to display in the list and in a the target
 *  text - any additional details about the item
 *  target - the element to display the item and description between the start and end times
 *  hide - whether or not to only display the item in the target when it's clicked on
 * 
 * Example:
 * 
 * Popcorn("#video").reference({
 *      start: 5,
 *      end: 6,
 *      item: 'chinchilla',
 *      text: 'a small furry animal',
 *      hide: false,
 *      target: 'annotation-box'
 * })
 */
(function (Popcorn) {
   Popcorn.plugin( "reference", (function(){

       function arrangeChildrenByTime( parentEl ) {
           if(parentEl.children.length <= 1) {
               return;
           }

           var tmpChildren = [];
           
           for(var i=0; i<parentEl.children.length; i++) {
               tmpChildren.push(parentEl.children[i]);
           }
           
           tmpChildren.sort(function sortByTime( a, b ){
               return a.getAttribute('data-popcorn-reference-start') - b.getAttribute('data-popcorn-reference-start');
           });
           
           for(i=0; i<tmpChildren.length; i++) {
                parentEl.appendChild(tmpChildren[i]);
           }
       };
        
       var _uls = {}; // a collection of our keyed-by-target unordered lists
       var _clicked = false;

       function isMostRecentClick( element ) {
           return _clicked === element;
       }

       function setClick( element ) {
           _clicked = element;
       }

       function removeClick() {
           _clicked = false;
       }
       
       return {
           // Define a manifest for the butter authoring tool to use
           manifest: {
             // Plugin meta data
             // will be used in the butter ui
             about:{
               name: "Display Reference Item"
             },
             // Object representation of the plugin options
             // a form will be constructed against this object
             options:{
               start : {elem:'input', type:'text', label:'Begin'},
               end : {elem:'input', type:'text', label:'End'},
               item : {elem: 'input', type: 'text', label: 'Item'},
               text : {elem: 'textarea', label: 'Text'},
               hide : {elem: 'input', type: 'checkbox', checked: false, label: 'Show Only on Click'}
             }
           },

           /**
            * Creates our li element as well as our annotation div and places them in the DOM
            */
           _setup: function( options ){
               var pop = this,
                   _target = Popcorn.dom.find(options.target);
               options._target = _target;
               
               if(!_uls[_target]) {
                   _uls[_target] = document.createElement('ul');
                   _target.appendChild(_uls[_target]);
               }
               options._ul = _uls[_target];
               
               // create a link that takes us directly to the vocabulary's start
               var a = document.createElement("a"),
                   text = document.createTextNode(options.item);
                   
                   a.appendChild(text);
                   a.setAttribute('href','#');
                   a.addEventListener('click',function jumpToTime(ev){
                      ev.preventDefault();
                      setClick(a);
                      pop.play(); // play needs to come BEFORE currentTime. It won't work if it comes after.
                      pop.currentTime(options.start);
                   });
                   options._link = a;
               
               options._container = document.createElement( "div" );
                   options._container.innerHTML = "<dfn>" + options.item + "</dfn> " + (options.text || '');
                   options._container.style.display = "none";
                   options._target.appendChild(options._container);
               
               options._li = document.createElement( "li" );
                   options._li.setAttribute('data-popcorn-reference-start', options.start);
                   options._li.appendChild(a);
                   options._ul.appendChild(options._li);
               
               arrangeChildrenByTime(options._ul);
           },
           /**
            * Display the element
            * (if it has been clicked or is not automatically hidden)
            */
           start: function( event, options ){
               if( !options.hide || isMostRecentClick(options._link) ) {
                    options._container.style.display = "";
               }
           },
           /**
            * Hide the element. Pause the video if we got here by
            * clicking on our li element
            */
           end: function( event, options ){
               // this will be set when we click on a vocab link
               if(isMostRecentClick(options._link)) {
                   removeClick();
                   this.pause();
               }
               options._container.style.display = "none";
           },
           /**
            * Remove elements from the DOM
            */
           _teardown: function( options ){
               ul = options._ul;
               if(ul) {
                   ul.removeChild(options._li);
                   
                   if(!ul.children.length) {
                       options._target.removeChild(options._ul);
                       delete _uls[options._target];
                   }
               }
               if(options._target) {
                   options._target.removeChild(options._container);
               }
           }
      };
   })());
})(Popcorn);
