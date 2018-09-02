import buble from 'rollup-plugin-buble'
import json from 'rollup-plugin-json'

export default {
	input: 'src/ColorWheel.js',
	output: [
		{
			name: 'ColorWheel',
			format: 'umd',
			file: 'build/ColorWheel.js'
		},
		{
			format: 'es',
			file: 'build/ColorWheel.module.js'
		}
	],
	plugins: [ json(), buble() ]
}