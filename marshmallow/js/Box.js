function Box(x, y, w, h, options) {
  this.w = w;
  this.h = h;
  this.body = Bodies.rectangle(x, y, w, h, options);

  World.add(world, this.body);
}

Box.prototype.render = function() {
  var position = this.body.position;

  push();
  noStroke();
  fill('#888');
  translate(position.x, position.y);
  rotate(this.body.angle);
  rect(0, 0, this.w, this.h);
  pop();
};
