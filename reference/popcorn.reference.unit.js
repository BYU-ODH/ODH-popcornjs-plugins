test( "Popcorn Reference Plugin", function() {

  // helper method to send a click to an element
  var sendClick = function(el) {
      var ev;
      if(document.createEvent) {
        ev = document.createEvent("HTMLEvents");
        ev.initEvent('click',true);
        el.dispatchEvent(ev);
      } else {
          ev = document.createEventObject();
          ev.eventType = "click";
          el.fireEvent('on' + ev.eventType, ev);
      }
  };
  
  var popped = Popcorn( "#video" ),
      target = "annotation",
      expects = 7,
      ref1start = 3,
      ref1end = 5,
      ref2start = 4,
      ref2end = 6,
      ref3start = 7,
      ref3end = 9,
      referenceCnt = 3;

  expect( expects );

  ok ( "reference" in popped, "reference is a method of the popped instance" );

  popped.reference({
    start: ref1start,
    end: ref1end,
    item: "foo",
    text: "bar",
    target: target,
    hide: false
  })
  .reference({
    start: ref2start,
    end: ref2end,
    item: "spam",
    text: "eggs",
    target: target,
    hide: true
  })
  .reference({
    start: ref3start,
    end: ref3end,
    item: "spam2",
    text: "eggs2",
    target: target,
    hide: true
  });
  
  // empty track events should be safe
  Popcorn.plugin.debug = true;
  
  var list = document.getElementById(target).childNodes[0],
      normalAnnot = list.childNodes[0],
      hideAnnot = list.childNodes[1],
      hideAnnot2 = list.childNodes[2];
  
  equal(list.childNodes.length, referenceCnt, "Our list contains " + referenceCnt + " items");
  equal(normalAnnot.style.display,"none","Our annotations are not displayed before their time");
  
  stop();
  
  popped.cue(ref1start, function(){
     equal(normalAnnot.style.display,"","non-hidden annotations are seen between 'start' and 'end'");
  });
  
  popped.cue(ref1end, function(){
     equal(normalAnnot.style.display,"none","annotations are hidden on 'end'");
  });
  
  popped.cue(ref2start, function(){
      equal(hideAnnot.style.display,"none","hidden annotations don't display on start");
      // send click to 'hidden' annotation
      sendClick(list.childNodes[2].childNodes[0]);
      setTimeout(function(){
          equal(hideAnnot2.style.display,"","Hidden annotation visible after click");
      });
  });

  popped.cue(ref3end, function(){
      ok(popped.paused(),"Player pauses after clicking on a link");
      start();
  });

  popped.play().mute();

});
