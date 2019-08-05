import ContentPlayer from 'mind-sdk/ContentPlayer';
import * as LEVEL from './ExampleGameLevel'; // Lodal the level file created in the folder test

// get dom elements
const DOMcontainer = document.getElementById('arenaContainer');

const DOMprev = document.getElementById('prev');
const DOMnext = document.getElementById('next');
const DOMplay = document.getElementById('play');

const DOMlevel = document.getElementById('level');
const DOMtheme = document.getElementById('theme');
const DOMdebug = document.getElementById('debug');

const DOMlocale = document.getElementById('locale');
const DOMfont = document.getElementById('font');

// load json file
fetch('../PixiArenas/ExampleGame/ExampleGame.json')
	.then(response => response.json())
	.then(jsonResponse => jsonLoaded(jsonResponse));

var jsonData;
function jsonLoaded (json) {
	jsonData = json;
	console.log(jsonData.module);
	console.log(jsonData.arenaKey);

	if (LEVEL && json) {
		json.puzzle = LEVEL;
	}

	// set max level
	DOMlevel.min = 1;
	DOMlevel.max = jsonData.puzzle.default.puzzles.length;

	// update theme list
	let themes = [{ 'name': 'Default' }].concat(jsonData.themes);
	for (let i = 0; i < themes.length; i++) {
		let option = document.createElement('option');
		option.value = i;
		option.text = themes[i].name;
		DOMtheme.add(option);
	}

	// update locale list
	let locales = jsonData.locale.options;
	for (let i = 0; i < locales.length; i++) {
		let option = document.createElement('option');
		option.value = locales[i].value;
		option.text = locales[i].name;
		DOMlocale.add(option);
	}
	DOMlocale.selectedIndex = jsonData.locale.defaultIndex;

	// update fontsize list
	let fonts = jsonData.font.sizeOptions;
	for (let i = 0; i < fonts.length; i++) {
		let option = document.createElement('option');
		option.value = fonts[i].value;
		option.text = fonts[i].name;
		DOMfont.add(option);
	}
	DOMfont.selectedIndex = jsonData.font.defaultSizeIndex;

	// load and play content (PixiArena)
	var options = { gameFps: 30 };
	var player = new ContentPlayer(DOMcontainer);
	player.load(jsonData.arenaKey, options).then(() => {
		player.play({ level: jsonData.puzzle.default });
		player.content.viewport.debugger = DOMdebug.checked;
	});
	window.mindPlayer = player; // just for test

	// add listeners
	DOMprev.onclick = function () { prevChapter(); };
	DOMnext.onclick = function () { nextChapter(); };
	DOMplay.onclick = function () { playChapter(); };
	DOMlevel.onchange = function () { levelChange(); };
	DOMdebug.onchange = function () { debugChange(); };
	DOMtheme.onchange = function () { themeChange(); };
	DOMlocale.onchange = function () { localeChange(); };
	DOMfont.onchange = function () { fontSizeChange(); };
}

function prevChapter () {
	let prevPuzzleIx = parseInt(DOMlevel.value) - parseInt(DOMlevel.min) - 1;
	if (prevPuzzleIx >= 0 ) {
		window.mindPlayer.playChapter(prevPuzzleIx);
		DOMlevel.stepDown();
		levelChange();
	}
}

function nextChapter () {
	let nextPuzzleIx = parseInt(DOMlevel.value); // +1
	let totalPuzzles = parseInt(DOMlevel.max);
	if (nextPuzzleIx < totalPuzzles) {
		window.mindPlayer.playChapter(nextPuzzleIx);
		DOMlevel.stepUp();
		levelChange();
	}
}

function playChapter () {
	let currentIx = parseInt(DOMlevel.value) - parseInt(DOMlevel.min);
	window.mindPlayer.playChapter(currentIx);
}

function levelChange () {
	let value = parseInt(DOMlevel.value);
	if (value > DOMlevel.max) {
		value = DOMlevel.max;
	} else if (value < DOMlevel.min) {
		value = DOMlevel.min;
	}

	DOMprev.disabled = DOMlevel.value === DOMlevel.min;
	DOMnext.disabled = DOMlevel.value === DOMlevel.max;
}

function debugChange () {
	window.mindPlayer.content.viewport.debugger = DOMdebug.checked;
}

function themeChange () {
	let themeIx = DOMtheme.value - 1;

	if (themeIx >= 0) {
		window.mindPlayer.content.setTheme({ themeData: jsonData.themes[themeIx].themeData });
	} else {
		window.mindPlayer.content.setTheme();
	}
}

function localeChange () {
	window.mindPlayer.content.setLocale(DOMlocale.value);
}

function fontSizeChange () {
	window.mindPlayer.content.textManager.scaleSizeByRatio(DOMfont.value);
}
