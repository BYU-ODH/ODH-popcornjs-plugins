/**
 * @todo - should try and implement tests against seeking, etc.
 */
test( "Popcorn Skip Plugin", function() {

  var popped = Popcorn( "#video" ),
      expects = 3,
      startTime = 2,
      endTime = 5;

  expect( expects );

  stop();

  ok ( "skip" in popped, "skip is a method of the popped instance" );

  popped.skip({
    start: startTime,
    end: endTime
  });

  popped.cue( startTime, function() {
    equal( popped.currentTime(), endTime, "User cannot view video at " + startTime + " seconds" );
  });
  
  popped.cue( endTime + 1, function() {
     popped.currentTime(startTime+1); 
  });
  
  popped.cue( startTime+1, function() {
    equal( popped.currentTime(), endTime, "User cannot go back to a frame in-between our skipped segment");
    popped.pause();
    start(); 
  });

  // empty track events should be safe
  Popcorn.plugin.debug = true;

  popped.play();

});