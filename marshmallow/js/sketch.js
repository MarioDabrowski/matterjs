// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events;

var engine = Engine.create();
    engine.constraintIterations = 2.5;
var world = engine.world;

var boundaries = [];
var chain;
var chainArray = [];
var cup;
var cupLeft;
var cupRight;
var dip;
var outlineColor = '#9e9e9e';
var lastPos;
var topOfCup;
var lowestPoint;
var highestPoint;
var narrowestPoint;
var widestPoint;

function checkDirection(object) {
  if(object.position.y > lastPos) {
    // console.log('update height');
  }

  lastPos = object.position.y;
}



// -------------
// Intersections
// -------------

// Helper function
var linesIntersection = function(x1, y1, x2, y2, x3, y3, x4, y4) {
  var denom = (y4-y3)*(x2-x1) - (x4-x3)*(y2-y1);
  var nom_a = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3));
  var nom_b = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3));
  var ua = nom_a / denom;
  var ub = nom_b / denom;
  var x = x1 + ua*(x2-x1);
  var y = y1 + ua*(y2-y1);
  var parallel = (ua == 0 && ub == 0);
  var coincident = (nom_a == 0 && nom_b == 0 && denom == 0);
  var within_seg1 = (ua >= 0 && ua <= 1);
  var within_seg2 = (ub >= 0 && ub <= 1)
  var within_segments = within_seg1 && within_seg2;
  return {
    x: x,
    y: y,
    parallel: parallel,
    coincident: coincident,
    within_seg1: within_seg1,
    within_seg2: within_seg2,
    within_segments: within_segments
  }
}

// Check all marshmallow sides for intersection
function marshmallowIntersection() {
  var intersections = [];

  for(var i = 0; i < marshmallow.body.vertices.length; i++) {
    var side = marshmallow.body.vertices[i];
    var nextSide = (i === marshmallow.body.vertices.length - 1) ? marshmallow.body.vertices[0] : marshmallow.body.vertices[i + 1];

    var intersection = linesIntersection(
      cup.body.vertices[0].x,
      cup.body.vertices[0].y,
      cup.body.vertices[1].x,
      cup.body.vertices[1].y,
      side.x,
      side.y,
      nextSide.x,
      nextSide.y
    );

    if(intersection.within_seg1 && intersection.within_seg2) {
      ellipse(intersection.x, intersection.y, 5);
    }

    intersections.push(intersection);
  }
}



// -----
// Setup
// -----

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);



  // Draw items out from the center instead of the top left
  rectMode(CENTER);



  // Create the floor
  boundaries.push(new Box(width/2, height - 5, 300, 10, {isStatic: true}));



  // Marshmallow chain
  var group = Body.nextGroup(true);

  chain = Composites.stack(width/2, 50, 5, 1, 10, 10, function(x, y) {
    return Bodies.rectangle(x, y, 25, 5, { collisionFilter: { group: group } });
  });

  marshmallow = new Box(width/2, 400, 100, 80, {density: 0.0001, collisionFilter: { group: group }});
  console.log(marshmallow.body);

  Composite.add(chain, marshmallow.body);

  Composites.chain(chain, 0.5, 0, -0.5, 0, { stiffness: 0.1, length: 5, render: { type: 'line' } });

  Composite.add(chain, Constraint.create({
    bodyB: chain.bodies[0],
    pointB: { x: -12, y: 0 },
    pointA: { x: chain.bodies[0].position.x, y: chain.bodies[0].position.y },
    stiffness: 0.8
  }));

  World.add(world, chain);


  cup = new Box(width/2, height - 70, 200, 120, {isStatic: true, isSensor: true});
  cupLeft = new Box(width/2 - 108, height - 70, 30, 120, {isStatic: true});
  cupRight = new Box(width/2 + 108, height - 70, 30, 120, {isStatic: true});

  topOfCup = cup.body.position.y - cup.h / 2;

  World.add(world, cup.body);

  // Mouse events
  var mouse = Mouse.create(canvas.elt);
      mouse.pixelRatio = pixelDensity();

  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2
    }
  });

  World.add(world, mouseConstraint);


  // Cup collision

  Events.on(engine, 'collisionStart', function(event) {
    if(event.pairs[0].bodyA === marshmallow.body && event.pairs[0].bodyB === cup.body) {
      dip = true;
    }
  });

  Events.on(engine, 'collisionEnd', function(event) {
    if(event.pairs[0].bodyA === marshmallow.body && event.pairs[0].bodyB === cup.body) {
      dip = false;
    }
  });

  Events.on(engine, 'collisionActive', function(event) {
    if(event.pairs[0].bodyA === marshmallow.body && event.pairs[0].bodyB === cup.body) {


      checkDirection(marshmallow.body);

      lowestPoint = marshmallow.body.vertices.reduce(function(sum, point) {
        if(point.y > sum) {
          return point.y;
        }

        return sum;
      }, 0);

      highestPoint = marshmallow.body.vertices.reduce(function(sum, point) {
        if(point.y < sum) {
          return point.y;
        }

        return sum;
      }, 10000);

      narrowestPoint = marshmallow.body.vertices.reduce(function(sum, point) {
        if(point.x > sum) {
          return point.x;
        }

        return sum;
      }, 0);

      widestPoint = marshmallow.body.vertices.reduce(function(sum, point) {
        if(point.x < sum) {
          return point.x;
        }

        return sum;
      }, 10000);
    }
  });



  // ---------------
  Engine.run(engine);
}



// ----
// Draw
// ----

function draw() {
  clear();

  var bodies = Composite.allBodies(engine.world);

  drawingContext.clearRect(0, 0, canvas.width, canvas.height);
  drawingContext.beginPath();

  for (var i = 0; i < bodies.length; i += 1) {
    var vertices = bodies[i].vertices;
    drawingContext.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      drawingContext.lineTo(vertices[j].x, vertices[j].y);
    }
    drawingContext.lineTo(vertices[0].x, vertices[0].y);
  }

  drawingContext.lineWidth = 1;
  drawingContext.strokeStyle = outlineColor;
  drawingContext.stroke();

  if(dip) {
    drawingContext.save();
    translate(marshmallow.body.position.x, marshmallow.body.position.y);
    rotate(marshmallow.body.angle);
    rect(0, 0, marshmallow.w, marshmallow.h);
    drawingContext.restore();
    drawingContext.save();
    drawingContext.clip();
    fill('red');
    var fillHeight = ((highestPoint - lowestPoint) * -1) - (((highestPoint - lowestPoint) + (lowestPoint - topOfCup)) * -1);
    rect(marshmallow.body.position.x, lowestPoint - fillHeight/2, widestPoint - narrowestPoint, fillHeight);
    drawingContext.restore();
  }

  marshmallowIntersection();
}
