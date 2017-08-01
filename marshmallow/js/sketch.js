// KNOWN BUGS
// 1. Hitting the marshmallow against the side of the cup triggers a cup + marshmallow collision even though they are not touching, incrementing
//    colorLayer, causing the colors to get darker without actually dipping.
// 2. If the marshmallow enters the cup upside down the colors don't get applied.
// 3.

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
    Events = Matter.Events,
    Vertices = Matter.Vertices;

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

var colorLayer = 0;
var colorLayers = ['#e8d2d2', '#d1a5a5', '#bb7878', '#a44b4b', '#8d1e1e'];



// -----
// Clear
// -----

var btnClear = document.querySelector('.btn-clear');

btnClear.addEventListener('click', function() {
  shapes = [];
  colorLayer = 0;
});



// ------
// Resize
// ------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



// ----------------
// Dip interactions
// ----------------

var dip = false;
var intersections;
var shapes = [];

function dipStatus(event, time) {
  if(event.pairs[0].bodyA === marshmallow.body && event.pairs[0].bodyB === cup.body) {
    if(time === 'start') {
      dip = true;
    } else {
      dip = false;
    }
  }
}

function dipFunc(shapeArray) {
  var angleDirection;

  if(marshmallow.body.angle > 0) {
    angleDirection = 'pos';
  } else {
    angleDirection = 'neg';
  }

  shape = {
    colorLayer: colorLayer,
    points: shapeArray,
    angleOffset: (angleDirection === 'pos') ? marshmallow.body.angle * -1 : marshmallow.body.angle,
    midpoint: [
      (marshmallow.body.vertices[0].x + marshmallow.body.vertices[1].x) /2,
      ((marshmallow.body.vertices[0].y + marshmallow.body.vertices[1].y) + 12) /2
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
    // if(intersections[0].side === 'bottom' && intersections[1].side === 'top' && marshmallow.body.angle < 2) {
    //   dipFunc([
    //     intersections[0].x,
    //     intersections[0].y,
    //     marshmallow.body.vertices[2].x,
    //     marshmallow.body.vertices[2].y,
    //     marshmallow.body.vertices[3].x,
    //     marshmallow.body.vertices[3].y,
    //     intersections[1].x,
    //     intersections[1].y
    //   ]);
    // }
    //
    // // Tilted to the right
    // if(intersections[0].side === 'bottom' && intersections[1].side === 'top' && marshmallow.body.angle > 2) {
    //   dipFunc([
    //     intersections[0].x,
    //     intersections[0].y,
    //     marshmallow.body.vertices[1].x,
    //     marshmallow.body.vertices[1].y,
    //     marshmallow.body.vertices[0].x,
    //     marshmallow.body.vertices[0].y,
    //     intersections[1].x,
    //     intersections[1].y
    //   ]);
    // }

    if(intersections[0].side === 'right' && intersections[1].side === 'left') {
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

    // if(intersections[0].side === 'bottom' && intersections[1].side === 'left') {
    //   dipFunc([
    //     intersections[0].x,
    //     intersections[0].y,
    //     marshmallow.body.vertices[2].x,
    //     marshmallow.body.vertices[2].y,
    //     intersections[1].x,
    //     intersections[1].y
    //   ]);
    // }
    //
    // if(intersections[0].side === 'right' && intersections[1].side === 'bottom') {
    //   dipFunc([
    //     intersections[0].x,
    //     intersections[0].y,
    //     marshmallow.body.vertices[1].x,
    //     marshmallow.body.vertices[1].y,
    //     intersections[1].x,
    //     intersections[1].y
    //   ]);
    // }
  } else {
    // if(
    //   marshmallow.body.vertices[0].y > topOfCup &&
    //   marshmallow.body.vertices[0].x < cup.body.vertices[1].x &&
    //   marshmallow.body.vertices[3].y > topOfCup &&
    //   marshmallow.body.vertices[3].x > cup.body.vertices[0].x
    // ) {
    //   shapes = [];
    //   dipFunc([
    //     marshmallow.body.vertices[0].x,
    //     marshmallow.body.vertices[0].y,
    //     marshmallow.body.vertices[1].x,
    //     marshmallow.body.vertices[1].y,
    //     marshmallow.body.vertices[2].x,
    //     marshmallow.body.vertices[2].y,
    //     marshmallow.body.vertices[3].x,
    //     marshmallow.body.vertices[3].y
    //   ]);
    // }
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
  var intersectionMap = ['top', 'right', 'bottom', 'left'];

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

  floor = new Box(width/2, height - 5, 300, 10, {
    isStatic: true,
    collisionFilter: {
      category: 0x0002
    }
  });

  cup = new Box(width/2, height - 70, 200, 120, {
    isStatic: true,
    isSensor: true,
    label: 'cup',
    collisionFilter: {
      category: 0x0002
    }
  });

  cupLeft = new Box(width/2 - 114, height - 70, 30, 120, {
    isStatic: true,
    label: 'cupLeft',
    collisionFilter: {
      category: 0x0002
    }
  });

  cupRight = new Box(width/2 + 114, height - 70, 30, 120, {
    isStatic: true,
    label: 'cupRight',
    collisionFilter: {
      category: 0x0002
    }
  });

  topOfCup = cup.body.position.y - cup.h / 2;

  World.add(world, cup.body);



  // -----------------
  // Marshmallow chain
  // -----------------

  marshmallow = new Box(width/2, 300, 80, 100, {
    density: 0.00001,
    label: 'marshmallow',
    collisionFilter: {
      category: 0x0001,
      mask: 0x0002
    }
  });

  marshmallowBody = loadImage('img/body.png');
  marshmallowBodyMask = loadImage('img/bodyMask.png');

  (function createChain() {
    var chainLinks = 6;
    var linkLength = 10;
    var hinges = [];

    // Create hinges
    for(var i = 0; i < chainLinks; i++) {
      var static = (i === 0) ? true : false ;

      var anchor = new Box(width/2, 100 + (linkLength * i), 5, 5, {
        isStatic: static,
        collisionFilter: {
          category: 0x0001
        }
      });

      hinges.push(anchor);
    }

    // Create links between hinges
    for(var i = 0; i < hinges.length; i++) {
      var constraint;

      if(i === chainLinks - 1) {
        constraint = Constraint.create({
          bodyA: hinges[i].body,
          bodyB: marshmallow.body,
          pointB: { x: 0, y: (marshmallow.h/2 * -1) + 12 },
          length: linkLength,
          damping: 0.5,
          stiffness: 0.1,
          label: 'marshmallowAttachment'
        });
      } else {
        constraint = Constraint.create({
          bodyA: hinges[i].body,
          bodyB: hinges[i + 1].body,
          length: linkLength,
          damping: 0.5,
          stiffness: 0.1
        });
      }

      World.add(world, constraint);
    }
  })();

  armLeft = Bodies.circle(width/2 - 40, 300, 5, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  armRight = Bodies.circle(width/2 + 40, 300, 5, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  var legRight = Bodies.circle(width/2 + 20, 300 + 50, 0.1, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  var legLeft = Bodies.circle(width/2 - 20, 300 + 50, 0.1, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  constraintArmLeft = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: armLeft,
    pointA: { x: -39, y: -20 },
    length: 40,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  constraintArmRight = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: armRight,
    pointA: { x: 39, y: -20 },
    length: 40,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  constraintLegRight = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: legRight,
    pointA: { x: 20, y: 49 },
    length: 30,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  constraintLegLeft = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: legLeft,
    pointA: { x: -20, y: 49 },
    length: 30,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  World.add(world, [
    armLeft,
    armRight,
    legRight,
    legLeft,
    constraintArmLeft,
    constraintArmRight,
    constraintLegRight,
    constraintLegLeft
  ]);



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

  mouseConstraint.collisionFilter.category = 0x0002;

  World.add(world, mouseConstraint);



  // ---------
  // Collision
  // ---------

  var interval;

  Events.on(engine, 'collisionStart', function(event) {
    if(event.pairs[0].bodyA.label === 'cup' && event.pairs[0].bodyB.label === 'marshmallow') {
      dipStatus(event, 'start');
      console.log('dip started');
    }
  });

  Events.on(engine, 'collisionEnd', function(event) {
    if(event.pairs[0].bodyA.label === 'cup' && event.pairs[0].bodyB.label === 'marshmallow') {
      dipStatus(event, 'end');

      if(interval) {
        clearInterval(interval);
        interval = null;
      }

      if(colorLayer < colorLayers.length - 1) {
        colorLayer += 1;
      }
    }
  });

  Events.on(engine, 'collisionActive', function(event) {
    for(var i = 0; i < event.pairs.length; i++) {
      if(event.pairs[i].bodyA.label === 'cup' && event.pairs[i].bodyB.label === 'marshmallow') {
        marshmallowIntersection();

        if(!interval) {
          interval = setInterval(function() {
            drawDip();
          }, 500);
        }
      }
    }
  });

  Engine.run(engine);
}



// ----
// Draw
// ----

function draw() {
  clear();



  // ----------------------
  // Outline matter objects
  // ----------------------

  push();
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
  pop();



  // --------------------
  // Draw the marshmallow
  // --------------------

  push();
  translate(marshmallow.body.position.x, marshmallow.body.position.y);
  rotate(marshmallow.body.angle);
  image(marshmallowBody, marshmallow.w/2 * -1, marshmallow.h/2 * -1, marshmallow.w, marshmallow.h);
  pop();



  // ---------------
  // Marshmallow dip
  // ---------------

  // Marshmallow Reference
  push();
  noStroke();
  fill('rgba(0,0,0, 0.2)');
  rect(0 + marshmallow.w/2, 0 + marshmallow.h/2, marshmallow.w, marshmallow.h);
  pop();

  // Draw all of the dipped shapes
  for(var i = 0; i < shapes.length; i++) {
    push();
    translate(marshmallow.w/2, 0);
    rotate(shapes[i].angleOffset);
    drawingContext.clip();
    // noStroke();
    stroke('black');
    strokeWeight(1);
    noFill();
    // fill(colorLayers[shapes[i].colorLayer]);
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
  // push();
  // noStroke();
  // noFill();
  // translate(marshmallow.body.position.x, marshmallow.body.position.y);
  // rotate(marshmallow.body.angle);
  // // image(marshmallowBodyMask, marshmallow.w/2 * -1, marshmallow.h/2 * -1, marshmallow.w, marshmallow.h);
  // rect(0, 0, marshmallow.w, marshmallow.h, 8);
  // pop();

  // Impose a screenshot of the chocolate onto the marshmallow
  // push();
  // translate(marshmallow.body.position.x, marshmallow.body.position.y);
  // rotate(marshmallow.body.angle - 1.5708);
  // drawingContext.clip();
  // if(pixelDensity() === 2) {
  //   scale(0.5);
  //   translate(marshmallow.h * -1, marshmallow.w * -1);
  // } else {
  //   translate(marshmallow.h/2 * -1, marshmallow.w/2 * -1);
  // }
  // drawingContext.drawImage(canvas, 0, 0);
  // pop();
  // push();
  // noStroke();
  // fill('rgba(0,0,0, 0.1)');
  // rect(marshmallow.h/2, marshmallow.w/2, marshmallow.h, marshmallow.w);
  // pop();

  // Cover the reference image in the top left hand corner that is used to grab the screen shot
  // push();
  // noStroke();
  // fill('#fee096');
  // rect(0 + marshmallow.h/2, 0 + marshmallow.w/2, marshmallow.h, marshmallow.w);
  // pop();

  // Cup
  push();
  drawingContext.globalAlpha = 0.5;
  fill('brown');
  rect(cup.body.position.x, cup.body.position.y, cup.w, cup.h);
  pop();



  // --------------
  // Draw the chain
  // --------------

  var allConstraints = Composite.allConstraints(engine.world);
  var marshmallowAttachment;

  push();
  noStroke();
  fill('black');
  ellipse(allConstraints[0].bodyA.position.x, allConstraints[0].bodyA.position.y, 25, 6);
  pop();

  for(var i = 0; i < allConstraints.length; i++) {
    if(allConstraints[i].label === 'marshmallowAttachment') {
      marshmallowAttachment = allConstraints[i];
    }

    if(allConstraints[i].label !== 'Mouse Constraint') {
      push();
      strokeWeight(2.5);

      line(
        allConstraints[i].bodyA.position.x + allConstraints[i].pointA.x,
        allConstraints[i].bodyA.position.y + allConstraints[i].pointA.y,
        allConstraints[i].bodyB.position.x + allConstraints[i].pointB.x,
        allConstraints[i].bodyB.position.y + allConstraints[i].pointB.y
      );
      pop();
    }
  }

  // Rope attachment on top of head
  push();
  noStroke();
  fill('black');
  translate(marshmallowAttachment.bodyB.position.x + marshmallowAttachment.pointB.x, marshmallowAttachment.bodyB.position.y + marshmallowAttachment.pointB.y);
  rotate(marshmallow.body.angle);
  ellipse(0, 0, 10, 3);
  pop();

  // Draw arms
  push();
  strokeWeight(2.5);
  ellipse(armLeft.position.x, armLeft.position.y, 10);
  ellipse(armRight.position.x, armRight.position.y, 10);
  pop();
}
