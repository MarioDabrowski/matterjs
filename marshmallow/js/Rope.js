function Rope(x, y, w, h, options) {
  this.w = w;
  this.h = h;
  this.body = Bodies.rectangle(x, y, w, h, options);
}

Rope.prototype.render = function() {
  var position = this.body.position;

  push();
  noFill;
  translate(position.x, position.y);
  rotate(this.body.angle);
  rect(0, 0, this.w, this.h);
  rect(0, 0, this.w, this.h);
  pop();
};
