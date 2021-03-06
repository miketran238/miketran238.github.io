$.fn.stick_in_parent = function(opts) {
	var doc, elm, enable_bottoming, fn, i, inner_scrolling, len, manual_spacer, offset_top, parent_selector, recalc_every, sticky_class;
	if (opts == null) {
	  opts = {};
	}
	sticky_class = opts.sticky_class, inner_scrolling = opts.inner_scrolling, recalc_every = opts.recalc_every, parent_selector = opts.parent, offset_top = opts.offset_top, manual_spacer = opts.spacer, enable_bottoming = opts.bottoming;
	if (offset_top == null) {
	  offset_top = 0;
	}
	if (parent_selector == null) {
	  parent_selector = void 0;
	}
	if (inner_scrolling == null) {
	  inner_scrolling = true;
	}
	if (sticky_class == null) {
	  sticky_class = "is_stuck";
	}
	doc = $(document);
	if (enable_bottoming == null) {
	  enable_bottoming = true;
	}
	fn = function(elm, padding_bottom, parent_top, parent_height, top, height, el_float, detached) {
	  var bottomed, detach, fixed, last_pos, last_scroll_height, offset, parent, recalc, recalc_and_tick, recalc_counter, spacer, tick;
	  if (elm.data("sticky_kit")) {
		return;
	  }
	  elm.data("sticky_kit", true);
	  last_scroll_height = doc.height();
	  parent = elm.parent();
	  if (parent_selector != null) {
		parent = parent.closest(parent_selector);
	  }
	  if (!parent.length) {
		throw "failed to find stick parent";
	  }
	  fixed = false;
	  bottomed = false;
	  spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
	  if (spacer) {
		spacer.css('position', elm.css('position'));
	  }
	  recalc = function() {
		var border_top, padding_top, restore;
		if (detached) {
		  return;
		}
		last_scroll_height = doc.height();
		border_top = parseInt(parent.css("border-top-width"), 10);
		padding_top = parseInt(parent.css("padding-top"), 10);
		padding_bottom = parseInt(parent.css("padding-bottom"), 10);
		parent_top = parent.offset().top + border_top + padding_top;
		parent_height = parent.height();
		if (fixed) {
		  fixed = false;
		  bottomed = false;
		  if (manual_spacer == null) {
			elm.insertAfter(spacer);
			spacer.detach();
		  }
		  elm.css({
			position: "",
			top: "",
			width: "",
			bottom: ""
		  }).removeClass(sticky_class);
		  restore = true;
		}
		top = elm.offset().top - (parseInt(elm.css("margin-top"), 10) || 0) - offset_top;
		height = elm.outerHeight(true);
		el_float = elm.css("float");
		if (spacer) {
		  spacer.css({
			width: elm.outerWidth(true),
			height: height,
			display: elm.css("display"),
			"vertical-align": elm.css("vertical-align"),
			"float": el_float
		  });
		}
		if (restore) {
		  return tick();
		}
	  };
	  recalc();
	  if (height === parent_height) {
		return;
	  }
	  last_pos = void 0;
	  offset = offset_top;
	  recalc_counter = recalc_every;
	  tick = function() {
		var css, delta, recalced, scroll, will_bottom, win_height;
		if (detached) {
		  return;
		}
		recalced = false;
		if (recalc_counter != null) {
		  recalc_counter -= 1;
		  if (recalc_counter <= 0) {
			recalc_counter = recalc_every;
			recalc();
			recalced = true;
		  }
		}
		if (!recalced && doc.height() !== last_scroll_height) {
		  recalc();
		  recalced = true;
		}
		scroll = win.scrollTop();
		if (last_pos != null) {
		  delta = scroll - last_pos;
		}
		last_pos = scroll;
		if (fixed) {
		  if (enable_bottoming) {
			will_bottom = scroll + height + offset > parent_height + parent_top;
			if (bottomed && !will_bottom) {
			  bottomed = false;
			  elm.css({
				position: "fixed",
				bottom: "",
				top: offset
			  }).trigger("sticky_kit:unbottom");
			}
		  }
		  if (scroll < top) {
			fixed = false;
			offset = offset_top;
			if (manual_spacer == null) {
			  if (el_float === "left" || el_float === "right") {
				elm.insertAfter(spacer);
			  }
			  spacer.detach();
			}
			css = {
			  position: "",
			  width: "",
			  top: ""
			};
			elm.css(css).removeClass(sticky_class).trigger("sticky_kit:unstick");
		  }
		  if (inner_scrolling) {
			win_height = win.height();
			if (height + offset_top > win_height) {
			  if (!bottomed) {
				offset -= delta;
				offset = Math.max(win_height - height, offset);
				offset = Math.min(offset_top, offset);
				if (fixed) {
				  elm.css({
					top: offset + "px"
				  });
				}
			  }
			}
		  }
		} else {
		  if (scroll > top) {
			fixed = true;
			css = {
			  position: "fixed",
			  top: offset
			};
			css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
			elm.css(css).addClass(sticky_class);
			if (manual_spacer == null) {
			  elm.after(spacer);
			  if (el_float === "left" || el_float === "right") {
				spacer.append(elm);
			  }
			}
			elm.trigger("sticky_kit:stick");
		  }
		}
		if (fixed && enable_bottoming) {
		  if (will_bottom == null) {
			will_bottom = scroll + height + offset > parent_height + parent_top;
		  }
		  if (!bottomed && will_bottom) {
			bottomed = true;
			if (parent.css("position") === "static") {
			  parent.css({
				position: "relative"
			  });
			}
			return elm.css({
			  position: "absolute",
			  bottom: padding_bottom,
			  top: "auto"
			}).trigger("sticky_kit:bottom");
		  }
		}
	  };
	  recalc_and_tick = function() {
		recalc();
		return tick();
	  };
	  detach = function() {
		detached = true;
		win.off("touchmove", tick);
		win.off("scroll", tick);
		win.off("resize", recalc_and_tick);
		$(document.body).off("sticky_kit:recalc", recalc_and_tick);
		elm.off("sticky_kit:detach", detach);
		elm.removeData("sticky_kit");
		elm.css({
		  position: "",
		  bottom: "",
		  top: "",
		  width: ""
		});
		parent.position("position", "");
		if (fixed) {
		  if (manual_spacer == null) {
			if (el_float === "left" || el_float === "right") {
			  elm.insertAfter(spacer);
			}
			spacer.remove();
		  }
		  return elm.removeClass(sticky_class);
		}
	  };
	  win.on("touchmove", tick);
	  win.on("scroll", tick);
	  win.on("resize", recalc_and_tick);
	  $(document.body).on("sticky_kit:recalc", recalc_and_tick);
	  elm.on("sticky_kit:detach", detach);
	  return setTimeout(tick, 0);
	};
	for (i = 0, len = this.length; i < len; i++) {
	  elm = this[i];
	  fn($(elm));
	}
	return this;
  };

  
;(function () {
	
	'use strict';



	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
			BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
			iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
			Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
			Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
			any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};

	var fullHeight = function() {

		if ( !isMobile.any() ) {
			$('.js-fullheight').css('height', $(window).height());
			$(window).resize(function(){
				$('.js-fullheight').css('height', $(window).height());
			});
		}

	};


	var counter = function() {
		$('.js-counter').countTo({
			 formatter: function (value, options) {
	      return value.toFixed(options.decimals);
	    },
		});
	};


	var counterWayPoint = function() {
		if ($('#colorlib-counter').length > 0 ) {
			$('#colorlib-counter').waypoint( function( direction ) {
										
				if( direction === 'down' && !$(this.element).hasClass('animated') ) {
					setTimeout( counter , 400);					
					$(this.element).addClass('animated');
				}
			} , { offset: '90%' } );
		}
	};

	// Animations
	var contentWayPoint = function() {
		var i = 0;
		$('.animate-box').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .animate-box.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight animated');
							} else {
								el.addClass('fadeInUp animated');
							}

							el.removeClass('item-animate');
						},  k * 200, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '85%' } );
	};


	var burgerMenu = function() {

		$('.js-colorlib-nav-toggle').on('click', function(event){
			event.preventDefault();
			var $this = $(this);

			if ($('body').hasClass('offcanvas')) {
				$this.removeClass('active');
				$('body').removeClass('offcanvas');	
			} else {
				$this.addClass('active');
				$('body').addClass('offcanvas');	
			}
		});



	};

	// Click outside of offcanvass
	var mobileMenuOutsideClick = function() {

		$(document).click(function (e) {
	    var container = $("#colorlib-aside, .js-colorlib-nav-toggle");
	    if (!container.is(e.target) && container.has(e.target).length === 0) {

	    	if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-colorlib-nav-toggle').removeClass('active');
			
	    	}
	    	
	    }
		});

		$(window).scroll(function(){
			if ( $('body').hasClass('offcanvas') ) {

    			$('body').removeClass('offcanvas');
    			$('.js-colorlib-nav-toggle').removeClass('active');
			
	    	}
		});

	};

	var clickMenu = function() {

		$('#navbar a:not([class="external"])').click(function(event){
			var section = $(this).data('nav-section'),
				navbar = $('#navbar');

				if ( $('[data-section="' + section + '"]').length ) {
			    	$('html, body').animate({
			        	scrollTop: $('[data-section="' + section + '"]').offset().top - 55
			    	}, 500);
			   }

		    if ( navbar.is(':visible')) {
		    	navbar.removeClass('in');
		    	navbar.attr('aria-expanded', 'false');
		    	$('.js-colorlib-nav-toggle').removeClass('active');
		    }

		    event.preventDefault();
		    return false;
		});


	};

	// Reflect scrolling in navigation
	var navActive = function(section) {

		var $el = $('#navbar > ul');
		$el.find('li').removeClass('active');
		$el.each(function(){
			$(this).find('a[data-nav-section="'+section+'"]').closest('li').addClass('active');
		});

	};

	var navigationSection = function() {

		var $section = $('section[data-section]');
		
		$section.waypoint(function(direction) {
		  	
		  	if (direction === 'down') {
		    	navActive($(this.element).data('section'));
		  	}
		}, {
	  		offset: '150px'
		});

		$section.waypoint(function(direction) {
		  	if (direction === 'up') {
		    	navActive($(this.element).data('section'));
		  	}
		}, {
		  	offset: function() { return -$(this.element).height() + 155; }
		});

	};






	var sliderMain = function() {
		
	  	$('#colorlib-hero .flexslider').flexslider({
			animation: "fade",
			slideshowSpeed: 5000,
			directionNav: true,
			start: function(){
				setTimeout(function(){
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			},
			before: function(){
				setTimeout(function(){
					$('.slider-text').removeClass('animated fadeInUp');
					$('.flex-active-slide').find('.slider-text').addClass('animated fadeInUp');
				}, 500);
			}

	  	});

	};

	var stickyFunction = function() {

		var h = $('.image-content').outerHeight();

		if ($(window).width() <= 992 ) {
			$("#sticky_item").trigger("sticky_kit:detach");
		} else {
			$('.sticky-parent').removeClass('stick-detach');
			$("#sticky_item").trigger("sticky_kit:detach");
			$("#sticky_item").trigger("sticky_kit:unstick");
		}

		$(window).resize(function(){
			var h = $('.image-content').outerHeight();
			$('.sticky-parent').css('height', h);


			if ($(window).width() <= 992 ) {
				$("#sticky_item").trigger("sticky_kit:detach");
			} else {
				$('.sticky-parent').removeClass('stick-detach');
				$("#sticky_item").trigger("sticky_kit:detach");
				$("#sticky_item").trigger("sticky_kit:unstick");

				$("#sticky_item").stick_in_parent();
				
			}
			

			

		});

		$('.sticky-parent').css('height', h);

		$("#sticky_item").stick_in_parent();

	};

	var owlCrouselFeatureSlide = function() {
		$('.owl-carousel').owlCarousel({
			animateOut: 'fadeOut',
		   animateIn: 'fadeIn',
		   autoplay: true,
		   loop:true,
		   margin:0,
		   nav:true,
		   dots: false,
		   autoHeight: true,
		   items: 1,
		   navText: [
		      "<i class='icon-arrow-left3 owl-direction'></i>",
		      "<i class='icon-arrow-right3 owl-direction'></i>"
	     	]
		})
	};

	// Document on load.
	$(function(){
		fullHeight();
		counter();
		counterWayPoint();
		contentWayPoint();
		burgerMenu();

		clickMenu();
		// navActive();
		navigationSection();
		// windowScroll();


		mobileMenuOutsideClick();
		sliderMain();
		stickyFunction();
		owlCrouselFeatureSlide();
	});


}());

