module.exports = function(el) {
  return el && el.parentNode
  ? dir(el, "previousSibling").length
  : -1
}

function dir(elem, dir) {
  var matched = [],
    cur = elem[dir];

  while (cur && cur.nodeType !== 9) {
    if (cur.nodeType === 1) {
      matched.push(cur);
    }
    cur = cur[dir];
  }
  return matched;
}