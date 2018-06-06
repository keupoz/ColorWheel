'use strict';

function textColor (rgb) {
 return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] <= 127.5 ? 'white' : '';
}

let
input = document.querySelector('input'),
picker = new ColorWheel(function (eventState, eventName) {
 if (eventState == 3) return;
 if (eventName == 'rotateHue' && this.HSV[1] == 0) return;
 
 let color = chroma.hsv(...this.HSV);
 
 input.style.background = input.value = color.name();
 input.style.color = textColor(color.rgb());
});

input.style.background = input.value = 'red';
input.style.color = 'white';

input.addEventListener('input', function () {
 try {
  let
  color = chroma(this.value),
  hsv   = color.hsv();
  
  picker.setHSV(hsv[0] || 0, hsv[1], hsv[2]);
  
  this.style.background = color.css();
  this.style.color = textColor(color.rgb());
 } catch (e) {}
});

document.querySelector('#ColorWheel').appendChild(picker.canvas);