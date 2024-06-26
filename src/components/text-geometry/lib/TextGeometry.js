/* From: https://github.com/mrdoob/three.js/blob/master/examples/jsm/geometries/TextGeometry.js
   with alternatons from ESM-style exports to CommonJS-style.


/**
 * Text = 3D Text
 *
 * parameters = {
 *  font: <THREE.Font>, // font
 *
 *  size: <float>, // size of the text
 *  height: <float>, // thickness to extrude text
 *  curveSegments: <int>, // number of points on the curves
 *
 *  bevelEnabled: <bool>, // turn on bevel
 *  bevelThickness: <float>, // how deep into text bevel goes
 *  bevelSize: <float>, // how far from text outline (including bevelOffset) is bevel
 *  bevelOffset: <float> // how far from text outline does bevel start
 * }
 */

const {
	ExtrudeGeometry
} = THREE; // 解构赋值语法，对象 THREE 中提取 ExtrudeGeometry属性的值,并将它赋给新创建的同名变量。


class TextGeometry extends ExtrudeGeometry {
	constructor(text, parameters = {}) {
		const font = parameters.font;
		if (font === undefined) {
			console.error('No font specified.');
			super(); // generate default extrude geometry
		} else {
			const shapes = font.generateShapes(text, parameters.size);
			// translate parameters to ExtrudeGeometry API
			parameters.depth = parameters.height !== undefined ? parameters.height : 50;
			// defaults
			if (parameters.bevelThickness === undefined) parameters.bevelThickness = 10;
			if (parameters.bevelSize === undefined) parameters.bevelSize = 8;
			if (parameters.bevelEnabled === undefined) parameters.bevelEnabled = false;
			super(shapes, parameters);
		}
		this.type = 'TextGeometry';
	}
}

THREE.TextGeometry = TextGeometry;
// module.exports = { TextGeometry };