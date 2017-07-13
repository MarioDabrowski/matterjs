function Box(x, y, w, h, options) {
  this.w = w;
  this.h = h;
  this.options = options;
  this.body = Bodies.rectangle(x, y, w, h, options);
  World.add(world, this.body);
}

Box.prototype.render = function() {
  var position = this.body.position;
  var angle = this.body.angle;

  push();
  noStroke();
  if(this.options.isStatic) {
    fill(0);
  } else {
    fill(99,99,99);
  }
  translate(position.x, position.y);
  rectMode(CENTER);
  rotate(angle);
  rect(0, 0, this.w, this.h);
  pop();
};
