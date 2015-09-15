'use strict';

var Dacoda  = require('dacoda').Dacoda;
var dacoda  = new Dacoda();
var postcss = require('postcss');
var prism   = require('./index.prism.js');
var plugins = [
	require('postcss-custom-properties'),
	require('postcss-apply'),
	require('postcss-nesting'),
	require('postcss-custom-media'),
	require('postcss-media-minmax'),
	require('postcss-custom-selectors'),
	require('perfectionist')
];

var container = document.createElement('span');
var output    = document.createElement('span');

container.className = 'dacoda-container';
output.className    = 'dacoda-output';

document.addEventListener('DOMContentLoaded', function () {
	var defaultValue = '@custom-media --sm-viewport (width < 30em);\n@custom-selector :--content p;\n\n:root {\n\t--paper-font: paper, sans-serif;\n\t--paper-font-body: {\n\t\tcolor: green;\n\t\tfont-family: var(--paper-font);\n\n\t\t@nest & .deep {\n\t\t\tcolor: black;\n\t\t}\n\t};\n}\n\n.main {\n\t@nest & :--content {\n\t\t@media (--sm-viewport) {\n\t\t\t@apply --paper-font-body;\n\t\t}\n\t}\n}';

	dacoda.element.input.value = location.href.slice(-1) === '#' || location.hash ? fromHash(location.hash.slice(1)) : defaultValue;

	dacoda.observe('keydown').then(onkeydown);

	dacoda.observe('input').then(oninput);

	dacoda.dispatch('input');

	container.appendChild(dacoda.element.block);
	container.appendChild(output);

	document.body.appendChild(container);
});

function onkeydown(event) {
	if (event.keyCode === 9) return ontab.call(this, event);
	if (event.metaKey && event.keyCode === 83) return onsave.call(this, event);
}

function ontab(event) {
	var input = dacoda.element.input;
	var end = dacoda.current.end;
	var value = dacoda.current.value;

	// prevent default action
	event.preventDefault();

	// insert tab character
	input.value = value.slice(0, end) + '\t' + value.slice(end);

	// update selection range
	input.selectionStart = input.selectionEnd = end + 1;

	// dispatch value change event
	dacoda.dispatch('input', event);
}

function oninput(event) {
	var before = dacoda.current.value;
	var after  = before;

	// try to process output 
	try {
		after = postcss(plugins).process(before, {});
	} catch (e) {}

	// set style and output
	dacoda.element.style.innerHTML  = Prism.highlight(before,  Prism.languages.cssnext);
	output.innerHTML = Prism.highlight(after, Prism.languages.cssnext);
}

// save event
function onsave(event) {
	// prevent default action
	event.preventDefault();

	location.hash = toHash(dacoda.current.value);
}

function fromHash(string) {
	return decodeURIComponent(string.replace(/\+/g, ' '));
}

function toHash(string) {
	return encodeURIComponent(string)
		.replace(/%20/g, '+')
		.replace(/%24/g, '$')
		.replace(/%26/g, '&')
		.replace(/%3A/g, ':')
		.replace(/%3B/g, ';')
		.replace(/%40/g, '@');
}
