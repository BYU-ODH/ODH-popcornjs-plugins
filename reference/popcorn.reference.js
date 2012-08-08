(function (Popcorn) {
   Popcorn.plugin( "reference", (function(){
       
       var els = document.getElementsByClassName('content-div');
       var list_targets = [];
       for(var i=0; i<els.length; i++) {
           if(!els[i].getAttribute('id')) {
               els[i].setAttribute('id',this.guid('area'));
           }
           list_targets.push(els[i].getAttribute('id'));
       }
       
       return {
           // Define a manifest for the butter authoring tool to use
           manifest: {
             // Plugin meta data
             // will be used in the butter ui
             about:{
               name: "Display Vocabulary"
             },
             // Object representation of the plugin options
             // a form will be constructed against this object
             options:{
               start : {elem:'input', type:'text', label:'Begin'},
               end : {elem:'input', type:'text', label:'End'},
               word : {elem: 'input', type: 'text', label: 'Item'},
               definition : {elem: 'textarea', label: 'Text'},
               word_list : {elem: 'select', options: list_targets, label: 'List'}
             }
           },
           _setup: function( options ){
               var pop = this;
               options._pause = false;
               
               // create a link that takes us directly to the vocabulary's start
               var a = document.createElement("a");
               a.setAttribute('href','#');
               a.addEventListener('click',function(ev){
                  ev.preventDefault();
                  // tells us that we will want to pause when this is complete
                  options._pause = true;
                  pop.currentTime(options.start);
                  pop.play();
               });
               a.innerText = options.word;
               
               options._target = Popcorn.dom.find(options.target);
               options._container = document.createElement( "div" );
               options._container.innerHTML = "<dfn>" + options.word + "</dfn> " + options.definition;
               options._container.style.display = "none";
               options._target.appendChild(options._container);
               
               
               // find our UL and append our LI
               if(options.word_list) {
                   options._word_list = Popcorn.dom.find(options.word_list);
                   options._li = document.createElement( "li" );
                   options._li.appendChild(a);
                   options._word_list.appendChild(options._li);
               }
           },
           start: function( event, options ){
               options._container.style.display = "block";
           },
           end: function( event, options ){
               // this will be set when we click on a vocab link
               if(options._pause) {
                   options._pause = false;
                   this.pause();
               }
               options._container.style.display = "none";
           },
           _teardown: function( options ){
                if(options._word_list) {
                    options._word_list.removeChild(options._li);
                }
                if(options._target) {
                    options._target.removeChild(options._container);
                }
           }
      };
   })());
})(Popcorn);