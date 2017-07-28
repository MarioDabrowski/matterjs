// Module aliases
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

var floor;
var cup;
var cupLeft;
var cupRight;
var topOfCup;

var chain;
var chainArray = [];



// ---------------------------
// Check marshmallow direction
// ---------------------------

var lastPos;
var travelingUp = false;

function checkDirection(object) {
  if(object.position.y > lastPos) {
    travelingUp = true;
  } else {
    travelingUp = false;
  }

  lastPos = object.position.y;
}



// ---------------------------------------------------------
// Figure out whether the marshmallow is being dipped or not
// ---------------------------------------------------------

var dip = false;

function dipStatus(event, time) {
  if(event.pairs[0].bodyA === marshmallow.body && event.pairs[0].bodyB === cup.body) {
    if(time === 'start') {
      dip = true;
    } else {
      dip = false;
    }
  }
}



// ------------
// Draw the dip
// ------------

var intersections;
var shapes = [];

function dipFunc(shapeArray) {
  var shapeAngle;
  var angleDirection;

  if(marshmallow.body.angle > 1.570796369472525) {
    shapeAngle = marshmallow.body.angle - 1.570796369472525;
    angleDirection = 'pos';
  } else {
    shapeAngle = 1.570796369472525 - marshmallow.body.angle;
    angleDirection = 'neg';
  }

  shape = {
    points: shapeArray,
    angle: shapeAngle,
    angleOffset: (angleDirection === 'pos') ? shapeAngle * -1 : shapeAngle,
    midpoint: [
      (marshmallow.body.vertices[3].x + marshmallow.body.vertices[0].x) /2,
      (marshmallow.body.vertices[3].y + marshmallow.body.vertices[0].y) /2
    ],
    offset: {
      x: 0,
      y: 0
    }
  };

  shape.offset.x = shape.midpoint[0];
  shape.offset.y = shape.midpoint[1];

  shapes.push(shape);
}

function drawDip() {
  if(intersections.length > 1) {

    // Tilted to the left
    if(intersections[0].side === 'bottom' && intersections[1].side === 'top' && marshmallow.body.angle < 2) {
      dipFunc([
        intersections[0].x,
        intersections[0].y,
        marshmallow.body.vertices[2].x,
        marshmallow.body.vertices[2].y,
        marshmallow.body.vertices[3].x,
        marshmallow.body.vertices[3].y,
        intersections[1].x,
        intersections[1].y
      ]);
    }

    // Tilted to the right
    if(intersections[0].side === 'bottom' && intersections[1].side === 'top' && marshmallow.body.angle > 2) {
      dipFunc([
        intersections[0].x,
        intersections[0].y,
        marshmallow.body.vertices[1].x,
        marshmallow.body.vertices[1].y,
        marshmallow.body.vertices[0].x,
        marshmallow.body.vertices[0].y,
        intersections[1].x,
        intersections[1].y
      ]);
    }

    if(intersections[0].side === 'right' && intersections[1].side === 'left') {
      dipFunc([
        intersections[0].x,
        intersections[0].y,
        marshmallow.body.vertices[1].x,
        marshmallow.body.vertices[1].y,
        marshmallow.body.vertices[2].x,
        marshmallow.body.vertices[2].y,
        intersections[1].x,
        intersections[1].y
      ]);
    }

    if(intersections[0].side === 'bottom' && intersections[1].side === 'left') {
      dipFunc([
        intersections[0].x,
        intersections[0].y,
        marshmallow.body.vertices[2].x,
        marshmallow.body.vertices[2].y,
        intersections[1].x,
        intersections[1].y
      ]);
    }

    if(intersections[0].side === 'right' && intersections[1].side === 'bottom') {
      dipFunc([
        intersections[0].x,
        intersections[0].y,
        marshmallow.body.vertices[1].x,
        marshmallow.body.vertices[1].y,
        intersections[1].x,
        intersections[1].y
      ]);
    }
  } else {
    if(
      marshmallow.body.vertices[0].y > topOfCup &&
      marshmallow.body.vertices[0].x < cup.body.vertices[1].x &&
      marshmallow.body.vertices[3].y > topOfCup &&
      marshmallow.body.vertices[3].x > cup.body.vertices[0].x
    ) {
      shapes = [];
      dipFunc([
        marshmallow.body.vertices[0].x,
        marshmallow.body.vertices[0].y,
        marshmallow.body.vertices[1].x,
        marshmallow.body.vertices[1].y,
        marshmallow.body.vertices[2].x,
        marshmallow.body.vertices[2].y,
        marshmallow.body.vertices[3].x,
        marshmallow.body.vertices[3].y
      ]);
    }
  }
}



// -------------
// Intersections
// -------------

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
  var intersectionMap = ['right', 'bottom', 'left', 'top'];

  intersections = [];

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
      intersection.side = intersectionMap[i];
      intersections.push(intersection);
    }
  }
}



// -----
// Setup
// -----

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);



  // ----------
  // Boundaries
  // ----------

  floor = new Box(width/2, height - 5, 300, 10, {isStatic: true});
  cup = new Box(width/2, height - 70, 200, 120, {isStatic: true, isSensor: true});
  cupLeft = new Box(width/2 - 108, height - 70, 30, 120, {isStatic: true});
  cupRight = new Box(width/2 + 108, height - 70, 30, 120, {isStatic: true});

  topOfCup = cup.body.position.y - cup.h / 2;

  World.add(world, cup.body);



  // -----------------
  // Marshmallow chain
  // -----------------

  var group = Body.nextGroup(true);

  // Create the chain link bodies
  chain = Composites.stack(width/2, 50, 5, 1, 10, 10, function(x, y) {
    return Bodies.rectangle(x, y, 25, 5, { collisionFilter: { group: group } });
  });

  // Add the marshmallow to the end of the chain
  marshmallow = new Box(width/2, 400, 100, 80, {density: 0.0001, collisionFilter: { group: group }});
  Composite.add(chain, marshmallow.body);

  Composites.chain(chain, 0.5, 0, -0.5, 0, { stiffness: 0.1, length: 5, render: { type: 'line' } });

  Composite.add(chain, Constraint.create({
    bodyB: chain.bodies[0],
    pointB: { x: -12, y: 0 },
    pointA: { x: chain.bodies[0].position.x, y: chain.bodies[0].position.y },
    stiffness: 0.8
  }));

  World.add(world, chain);



  // ------------
  // Mouse events
  // ------------

  var mouse = Mouse.create(canvas.elt);
      mouse.pixelRatio = pixelDensity();

  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2
    }
  });

  World.add(world, mouseConstraint);



  // -------------
  // Cup collision
  // -------------

  var interval;

  Events.on(engine, 'collisionStart', function(event) {
    dipStatus(event, 'start');
  });

  Events.on(engine, 'collisionEnd', function(event) {
    dipStatus(event, 'end');

    if(interval) {
      clearInterval(interval);
      interval = null;
    }
  });

  Events.on(engine, 'collisionActive', function(event) {
    marshmallowIntersection();
    checkDirection(marshmallow.body);

    if(!interval) {
      interval = setInterval(function() {
        drawDip();
      }, 100);
    }
  });

  Engine.run(engine);
}



// ----
// Draw
// ----

function draw() {
  clear();

  // Draw lines around all of the bodies in the engine
  var bodies = Composite.allBodies(engine.world);

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
  drawingContext.strokeStyle = '#9e9e9e';
  drawingContext.stroke();

  push();
  noStroke();
  fill('rgba(0,0,0, 0)');
  rect(0 + marshmallow.h/2, 0 + marshmallow.w/2, marshmallow.h, marshmallow.w);
  pop();

  for(var i = 0; i < shapes.length; i++) {
    push();
    translate(marshmallow.h/2, 0);
    rotate(shapes[i].angleOffset);
    noStroke();
    fill('brown');
    quad(
      shapes[i].points[0] - shapes[i].offset.x,
      shapes[i].points[1] - shapes[i].offset.y,
      shapes[i].points[2] - shapes[i].offset.x,
      shapes[i].points[3] - shapes[i].offset.y,
      shapes[i].points[4] - shapes[i].offset.x,
      shapes[i].points[5] - shapes[i].offset.y,
      shapes[i].points[6] - shapes[i].offset.x,
      shapes[i].points[7] - shapes[i].offset.y
    );
    pop();
  }

  // Draw the outline of the marshmallow that will act as a mask for the sticky chocolate
  push();
  noStroke();
  fill('rgba(0,0,0, 0)');
  translate(marshmallow.body.position.x, marshmallow.body.position.y);
  rotate(marshmallow.body.angle);
  rect(0, 0, marshmallow.w, marshmallow.h);
  pop();

  // Impose a screenshot of the chocolate onto the marshmallow
  push();
  translate(marshmallow.body.position.x, marshmallow.body.position.y);
  rotate(marshmallow.body.angle - 1.5708);
  drawingContext.clip();
  drawingContext.globalAlpha = 0.5;
  if(pixelDensity() === 2) {
    scale(0.5);
    translate(marshmallow.h * -1, marshmallow.w * -1);
  } else {
    translate(marshmallow.h/2 * -1, marshmallow.w/2 * -1);
  }
  drawingContext.drawImage(
    canvas,
    0,
    0
  );
  pop();

  // Cover the reference image in the top left hand corner that is used to grab the screen shot
  push();
  noStroke();
  fill('rgba(255,255,255, 1)');
  rect(0 + marshmallow.h/2, 0 + marshmallow.w/2, marshmallow.h, marshmallow.w);
  pop();

  //
  push();
  drawingContext.globalAlpha = 0.5;
  fill('brown');
  rect(cup.body.position.x, cup.body.position.y, cup.w, cup.h);
  pop();
}
