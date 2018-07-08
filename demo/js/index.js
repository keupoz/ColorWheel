'use strict';

// Returns readable text color for input
function textColor (rgb) {
	return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] <= 127.5 ? 'white' : '';
}

var
input = document.querySelector('input'),
picker = new ColorWheel(function (eventState, eventName) {
	// Do nothing if color is changed by input
	// (because it updates it)
	if (eventState == 3) return;
	
	// Do nothing if color is chromatic
	if (eventName == 'rotateHue' && this.HSV[1] == 0) return;
	
	let color = chroma.hsv.apply(chroma, this.HSV);
	
	// Change background and value of input
	input.style.background = input.value = color.name();
	// Make text color readable
	input.style.color = textColor(color.rgb());
});

// Initial statement
input.style.background = input.value = 'red';
input.style.color = 'white';

input.addEventListener('input', function () {
	// Prevents errors when chroma can't recognize the input
	try {
		var
		color = chroma(this.value),
		hsv   = color.hsv();
		
		// Update the wheel
		picker.setHSV(hsv[0] || 0, hsv[1], hsv[2]);
		
		// Update input background and text color
		this.style.background = color.css();
		this.style.color = textColor(color.rgb());
	} catch (e) {}
});

document.querySelector('#ColorWheel').appendChild(picker.canvas);