var version = "1.0.1";

var FULL_ARC = Math.PI * 2,
    DEGREE = Math.PI / 180,
    RAD_30 = Math.PI / 6,
    RAD_60 = Math.PI / 3,
    RAD_90 = Math.PI / 2,
    SQRT_3 = Math.sqrt(3),
    SIN_60 = SQRT_3 / 2,
    SATURATION_GRADIENT_Y_MULTIPLIER = SQRT_3 / 4;

function range1(number) {
	return Math.max(0, Math.min(number, 1));
}
function range360(deg) {
	deg -= 360 * (deg / 360 | 0);
	if (deg < 0) deg += 360;
	return deg;
}

function ColorWheel(callback) {
	var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 256;

	var background = document.createElement('canvas').getContext('2d'),
	    triangle = document.createElement('canvas').getContext('2d'),
	    output = document.createElement('canvas').getContext('2d');

	var self = this,
	    center = void 0,
	    radius = void 0,
	    spectreThickness = void 0,
	    spectreSection = void 0,
	    triangleRadius = void 0,
	    triangleBorder = void 0,
	    triangleSide = void 0,
	    triangleHeight = void 0,
	    saturationGradient = void 0,
	    brightnessGradient = void 0,
	    hueRad = 0,
	    toneX = void 0,
	    toneY = void 0,
	    CurrentHue = 0,
	    CurrentSaturation = 1,
	    CurrentBrightness = 1,
	    vertices = [0, 0, 0].map(function () {
		return { x: 0, y: 0 };
	});

	this.HSV = [0, 1, 1];
	this.HSL = [0, 1, 0.5];
	this.css = 'hsl(0, 100%, 50%)';
	this.canvas = output.canvas;

	function updateBackground() {
		background.save();
		background.translate(center, center);

		// Background with center shadow
		background.beginPath();
		background.arc(0, 0, radius, 0, FULL_ARC);

		background.fillStyle = background.createRadialGradient(0, 0, 0, 0, 0, radius);
		background.fillStyle.addColorStop(0, '#000');
		background.fillStyle.addColorStop(1, '#555');

		background.fill();
		background.closePath();

		// Center
		background.beginPath();
		background.arc(0, 0, radius - 2 * spectreThickness, 0, FULL_ARC);
		background.fillStyle = '#444';
		background.fill();
		background.closePath();

		// Spectre
		for (var angle = 0; angle < 360; angle++) {
			background.rotate(-DEGREE);
			background.fillStyle = 'hsl(' + angle + ', 100%, 50%)';
			background.fillRect(triangleRadius - spectreThickness / 4, 0, spectreThickness, spectreSection);
		}

		background.beginPath();
		background.arc(0, 0, triangleRadius, 0, FULL_ARC);
		background.fillStyle = 'rgba(68,68,68,0.25)';
		background.fill();
		background.closePath();

		background.restore();
	}

	function updateTriangle() {
		triangle.save();
		triangle.clearRect(0, 0, size, size);

		triangle.translate(center, center);
		triangle.rotate(-hueRad);

		// Triangle shape
		triangle.beginPath();
		triangle.moveTo(vertices[0].x, vertices[0].y);
		triangle.lineTo(vertices[1].x, vertices[1].y);
		triangle.lineTo(vertices[2].x, vertices[2].y);
		triangle.closePath();

		// Color filling
		triangle.fillStyle = 'hsl(' + CurrentHue + ', 100%, 50%)';
		triangle.fill();

		// Saturation and brightness gradients
		triangle.fillStyle = brightnessGradient;
		triangle.fill();

		triangle.save();
		triangle.globalCompositeOperation = 'lighter';
		triangle.fillStyle = saturationGradient;
		triangle.fill();
		triangle.restore();

		// Stroke triangle
		triangle.strokeStyle = 'whitesmoke';
		triangle.lineWidth = triangleBorder;
		triangle.stroke();

		// Tone cursor
		triangle.beginPath();
		triangle.arc(toneX, toneY, 5, 0, FULL_ARC);
		triangle.fillStyle = self.css;
		triangle.stroke();
		triangle.fill();
		triangle.closePath();

		triangle.restore();
	}

	function updateOutput() {
		output.clearRect(0, 0, size, size);
		output.drawImage(background.canvas, 0, 0);
		output.drawImage(triangle.canvas, 0, 0);
	}

	function updateToneCursor() {
		if (CurrentSaturation) {
			var saturationRad = CurrentSaturation * RAD_60,
			    _radius = CurrentBrightness * triangleHeight / Math.cos(saturationRad - RAD_30),
			    angle = RAD_90 - saturationRad;

			toneX = _radius * Math.cos(angle) + vertices[2].x;
			toneY = -_radius * Math.sin(angle) - vertices[2].y;
		} else {
			toneX = vertices[1].x;
			toneY = vertices[1].y - CurrentBrightness * triangleSide;
		}
	}

	// Makes x and y relative to canvas dimension
	function makePointRelative(point) {
		var rect = output.canvas.getBoundingClientRect();
		point[0] = point[0] - rect.left - center;
		point[1] = -point[1] + rect.top + center;

		return point;
	}

	function rotateHue(point) {
		var x = point[0],
		    y = point[1];

		hueRad = Math.acos(x / Math.hypot(x, y));
		if (y < 0) hueRad = FULL_ARC - hueRad;

		CurrentHue = Math.round(hueRad / DEGREE);

		self.HSV[0] = self.HSL[0] = CurrentHue;

		updateCSS();

		updateTriangle();
		updateOutput();
	}

	function moveTone(point, start) {
		var x = point[0],
		    y = point[1],
		    cursorDistance = Math.hypot(x, y);

		if (hueRad != 0) {
			var cursorAngle = Math.acos(x / cursorDistance);

			if (y < 0) cursorAngle = FULL_ARC - cursorAngle;

			var rotation = cursorAngle - hueRad;

			x = cursorDistance * Math.cos(rotation);
			y = cursorDistance * Math.sin(rotation);
		}

		var relativeX = x - vertices[1].x,
		    saturationY = y - vertices[2].y,
		    brightnessY = -y + vertices[1].y,
		    saturationHypot = Math.hypot(relativeX, saturationY),
		    brightnessHypot = Math.hypot(relativeX, brightnessY),
		    saturationCos = saturationY / saturationHypot,
		    brightnessCos = brightnessY / Math.hypot(relativeX, brightnessY);

		if (start) return saturationCos >= 0.5 && saturationCos <= 1 && brightnessCos >= 0.5 && brightnessCos <= 1 && relativeX >= 0;

		if (relativeX < 0) {
			CurrentSaturation = 0;
			CurrentBrightness = range1(saturationY / triangleSide);
		} else {
			var saturationRad = Math.acos(saturationCos),
			    brightnessRad = Math.acos(brightnessCos);

			if (brightnessRad > RAD_60 && brightnessRad % RAD_30) CurrentSaturation = brightnessHypot * Math.cos(brightnessRad - RAD_60) / triangleSide;else CurrentSaturation = saturationRad / RAD_60;
			if (saturationRad > RAD_60 && saturationRad % RAD_30) CurrentBrightness = saturationHypot * Math.cos(saturationRad - RAD_60) / triangleSide;else CurrentBrightness = saturationHypot * Math.cos(saturationRad - RAD_30) / triangleHeight;

			CurrentSaturation = range1(CurrentSaturation);
			CurrentBrightness = range1(CurrentBrightness);
		}

		self.HSV[0] = CurrentHue;
		self.HSV[1] = CurrentSaturation;
		self.HSV[2] = CurrentBrightness;

		updateHSL();
		updateToneCursor();

		updateTriangle();
		updateOutput();
	}

	function getMoveHandler(point) {
		var cursorDistance = Math.hypot(point[0], point[1]);
		// Spectre wheel
		if (cursorDistance >= triangleRadius && cursorDistance <= radius) return rotateHue;
		// Triangle
		else if (moveTone(point, true)) return moveTone;
	}

	function registerEvent(start, move, end, cancel, getPoint) {
		output.canvas.addEventListener(start, function (e) {
			var point = makePointRelative(getPoint(e)),
			    handler = getMoveHandler(point);

			if (!handler) return;

			e.preventDefault();

			handler(point);
			callback.call(self, 0, handler.name);

			function moveHandler(e) {
				handler(makePointRelative(getPoint(e)));
				callback.call(self, 1, handler.name);
			}

			function removeHandlers() {
				removeEventListener(move, moveHandler);
				removeEventListener(end, removeHandlers);
				removeEventListener(cancel, removeHandlers);
				callback.call(self, 2, handler.name);
			}

			addEventListener(move, moveHandler);
			addEventListener(end, removeHandlers);
			addEventListener(cancel, removeHandlers);
		});
	}

	function updateCSS() {
		self.css = 'hsl(' + self.HSL[0] + ', ' + Math.round(self.HSL[1] * 100) + '%, ' + Math.round(self.HSL[2] * 100) + '%)';
	}

	function updateHSL() {
		var saturation = CurrentSaturation,
		    a = (2 - saturation) * CurrentBrightness;

		self.HSL[0] = CurrentHue;
		self.HSL[1] = saturation * CurrentBrightness / (a <= 1 ? a : 2 - a) || 0;
		self.HSL[2] = a / 2;

		updateCSS();
	}

	function updateHSV() {
		var saturation = self.HSL[1],
		    lightness = self.HSL[2];

		saturation *= lightness < 0.5 ? lightness : 1 - lightness;

		CurrentHue = self.HSV[0] = CurrentHue;
		CurrentBrightness = self.HSV[2] = lightness + saturation;
		CurrentSaturation = self.HSV[1] = 2 * saturation / CurrentBrightness;
	}

	this.setSize = function (value) {
		background.canvas.width = background.canvas.height = triangle.canvas.width = triangle.canvas.height = output.canvas.width = output.canvas.height = value;

		size = value;
		center = value / 2;
		radius = value / 2;
		spectreThickness = radius / 4.5;
		spectreSection = spectreThickness / 4;

		triangleRadius = radius - spectreThickness * 3 / 4;
		triangleHeight = 1.5 * triangleRadius;
		triangleBorder = radius / 32;

		vertices[0].x = triangleRadius;
		vertices[1].x = vertices[2].x = -triangleRadius / 2;
		vertices[1].y = triangleRadius * SIN_60;
		vertices[2].y = -vertices[1].y;

		triangleSide = 2 * vertices[1].y;

		saturationGradient = triangle.createLinearGradient(vertices[2].x, vertices[2].y, triangleRadius / 4, triangleRadius * SATURATION_GRADIENT_Y_MULTIPLIER);
		saturationGradient.addColorStop(0, 'white');
		saturationGradient.addColorStop(1, 'rgba(255,255,255,0)');

		brightnessGradient = triangle.createLinearGradient(vertices[1].x, vertices[0].y, vertices[0].x, vertices[0].y);
		brightnessGradient.addColorStop(0, 'black');
		brightnessGradient.addColorStop(1, 'transparent');

		updateToneCursor();

		updateBackground();
		updateTriangle();
		updateOutput();
	};

	this.setHSV = function (h, s, v) {
		CurrentHue = Math.round(range360(h));
		CurrentSaturation = range1(s);
		CurrentBrightness = range1(v);

		hueRad = CurrentHue * DEGREE;

		updateHSL();
		updateToneCursor();

		updateTriangle();
		updateOutput();

		callback.call(this, 3, 'setHSV');
	};

	this.setHSL = function (h, s, l) {
		this.HSL[0] = Math.round(range360(h));
		this.HSL[1] = range1(s);
		this.HSL[2] = range1(l);

		hueRad = this.HSL[0] * DEGREE;

		updateCSS();
		updateHSV();
		updateToneCursor();

		updateTriangle();
		updateOutput();

		callback.call(this, 3, 'setHSL');
	};

	registerEvent('touchstart', 'touchmove', 'touchend', 'touchcancel', function (e) {
		return [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
	});
	registerEvent('mousedown', 'mousemove', 'mouseup', 'mouseleave', function (e) {
		return [e.clientX, e.clientY];
	});

	this.setSize(size);
}

ColorWheel.version = version;

export default ColorWheel;
