/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	var bodyEl = document.body, 
		docElem = window.document.documentElement,
		support = { transitions: Modernizr.csstransitions },
		// transition end event name
		transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		onEndTransition = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.transitions ) {
					if( ev.target != this ) return;
					this.removeEventListener( transEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(this); }
			};
			if( support.transitions ) {
				el.addEventListener( transEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		// window sizes
		win = {width: window.innerWidth, height: window.innerHeight},
		// some helper vars to disallow scrolling
		lockScroll = false, xscroll, yscroll,
		scrollContainer = document.querySelector('.container'),
		// the main slider and its items
		sliderEl = document.querySelector('.slider'),
		items = [].slice.call(sliderEl.querySelectorAll('.slide')),
		// total number of items
		itemsTotal = items.length,
		// navigation controls/arrows
		navRightCtrl = sliderEl.querySelector('.button--nav-next'),
		navLeftCtrl = sliderEl.querySelector('.button--nav-prev'),
		zoomCtrl = sliderEl.querySelector('.button--zoom'),
		// index of current item
		current = 0,
		// check if an item is "open"
		isOpen = false,
		isFirefox = typeof InstallTrigger !== 'undefined',
		// scale body when zooming into the items, if not Firefox (the performance in Firefox is not very good)
		bodyScale = isFirefox ? false : 3;

	// from http://www.sberry.me/articles/javascript-event-throttling-debouncing
	function throttle(fn, delay) {
		var allowSample = true;

		return function(e) {
			if (allowSample) {
				allowSample = false;
				setTimeout(function() { allowSample = true; }, delay);
				fn(e);
			}
		};
	}

	function init() {
		initEvents();
	}

	// event binding
	function initEvents() {
		// play current video
		zoomCtrl.addEventListener('click', function() {
			var video = items[current].getElementsByTagName('video')[0];
			video.play();
		});

		// navigation
		navRightCtrl.addEventListener('click', function() {
			var video = items[current].getElementsByTagName('video')[0];
			video.pause(); 
			navigate('right');
		});
		navLeftCtrl.addEventListener('click', function() {
			var video = items[current].getElementsByTagName('video')[0];
			video.pause();
			navigate('left');
		});

		// window resize
		window.addEventListener('resize', throttle(function(ev) {
			// reset window sizes
			win = {width: window.innerWidth, height: window.innerHeight};

			// reset transforms for the items (slider items)
			items.forEach(function(item, pos) {
				if( pos === current ) return;
				var el = item.querySelector('.slide__mover');
				dynamics.css(el, { translateX: el.offsetWidth });
			});
		}, 10));

		// keyboard navigation events
		document.addEventListener( 'keydown', function( ev ) {
			if( isOpen ) return; 
			var keyCode = ev.keyCode || ev.which;
			switch (keyCode) {
				case 37:
					navigate('left');
					break;
				case 39:
					navigate('right');
					break;
			}
		} );
	}

	// navigate the slider
	function navigate(dir) {
		var itemCurrent = items[current],
			currentEl = itemCurrent.querySelector('.slide__mover'),
			currentTitleEl = itemCurrent.querySelector('.slide__title');
		
			var video = itemCurrent.getElementsByTagName('video')[0];
			video.style = 'display:none';

		// update new current value
		if( dir === 'right' ) {
			current = current < itemsTotal-1 ? current + 1 : 0;
		}
		else {
			current = current > 0 ? current - 1 : itemsTotal-1;
		}

		var itemNext = items[current],
			nextEl = itemNext.querySelector('.slide__mover'),
			nextTitleEl = itemNext.querySelector('.slide__title');
			
			var video = itemNext.getElementsByTagName('video')[0];
			video.style = 'display:block';
			
		// animate the current element out
		dynamics.animate(currentEl, { opacity: 0,  translateX: dir === 'right' ? -1*currentEl.offsetWidth/2 : currentEl.offsetWidth/2, rotateZ: dir === 'right' ? -10 : 10 }, {
			type: dynamics.spring,
			duration: 2000,
			friction: 600,
			complete: function() {
				dynamics.css(itemCurrent, { opacity: 0, visibility: 'hidden' });
			}
		});

		// animate the current title out
		dynamics.animate(currentTitleEl, { translateX: dir === 'right' ? -250 : 250, opacity: 0 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 450
		});

		// set the right properties for the next element to come in
		dynamics.css(itemNext, { opacity: 1, visibility: 'visible' });
		dynamics.css(nextEl, { opacity: 0, translateX: dir === 'right' ? nextEl.offsetWidth/2 : -1*nextEl.offsetWidth/2, rotateZ: dir === 'right' ? 10 : -10 });

		// animate the next element in
		dynamics.animate(nextEl, { opacity: 1, translateX: 0 }, {
			type: dynamics.spring,
			duration: 2000,
			friction: 600,
			complete: function() {
				items.forEach(function(item) { classie.remove(item, 'slide--current'); });
				classie.add(itemNext, 'slide--current');
			}
		});

		// set the right properties for the next title to come in
		dynamics.css(nextTitleEl, { translateX: dir === 'right' ? 250 : -250, opacity: 0 });
		// animate the next title in
		dynamics.animate(nextTitleEl, { translateX: 0, opacity: 1 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 650
		});
		
	}

	init();

})(window);