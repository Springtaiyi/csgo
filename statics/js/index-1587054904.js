"use strict";

$(function () {
  /**
   * Exclusive cases timers
   */
  var exFreeCaseTimer = $('.cases5.free-case .case5-timer');
  var exPremiumCaseTimer = $('.cases5.premium-case .case5-timer');
  $.each([exFreeCaseTimer, exPremiumCaseTimer], function (_i, element) {
    setDropETA(element);
    cdUpdateTimeEx(element);
  });
  var exFreeCaseTimerUpdate = setInterval(function () {
    cdUpdateTimeEx(exFreeCaseTimer);
  }, 1000);
  var exPremiumCaseTimerUpdate = setInterval(function () {
    cdUpdateTimeEx(exPremiumCaseTimer);
  }, 1000);

  function setDropETA(el) {
    var timestamp = el.data('timestamp') * 1000;
    var remainingSeconds = el.data('remain') * 1000;
    var elapseDateObj = new Date();
    var elapseTime = timestamp || Date.now() + remainingSeconds;
    elapseDateObj.setTime(elapseTime);
    el.data('ETA', elapseDateObj);
    return elapseDateObj;
  }

  function cdUpdateTimeEx(el) {
    var ETA = el.data('ETA');

    if (!ETA) {
      ETA = setDropETA(el);
    }

    var diffTime = Math.round((ETA - Date.now()) / 1000);

    if (diffTime <= 0) {
      //el.closest('.cases5-item').addClass('inactive_timer');
      if (el.closest('.cases5-item').hasClass('free-case')) {
        clearInterval(exFreeCaseTimerUpdate);
      }

      if (el.closest('.cases5-item').hasClass('premium-case')) {
        clearInterval(exPremiumCaseTimerUpdate);
      }

      diffTime = 0;
    }

    secondsToTimerEx(diffTime, el);
  }

  function secondsToTimerEx(seconds, el) {
    seconds = seconds * 1000;
    var h = addZero(Math.floor(seconds % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)));
    var m = addZero(Math.floor(seconds % (1000 * 60 * 60) / (1000 * 60)));
    var elH = el.find('.ex-case__timer__hours');
    var elM = el.find('.ex-case__timer__minutes');
    elH.text(h);
    elM.text(m);
  }
  /**
   * Sale timer
   */


  var saleBlock = $('.sale-banner');
  var activeTimer = saleBlock.find('.sale-banner__time-remain');
  var elDays = activeTimer.find('.tr__days span');
  var elHours = activeTimer.find('.tr__hours span');
  var elMinutes = activeTimer.find('.tr__mins span');
  var elSaleButton = saleBlock.find('.sale-banner__link');
  var saleTimerShown = false;
  setDropETA(activeTimer);
  cdUpdateTime(activeTimer);
  var saleTimerUpdate = setInterval(function () {
    cdUpdateTime(activeTimer);
  }, 1000);

  function cdUpdateTime(el) {
    var ETA = el.data('ETA');

    if (!ETA) {
      ETA = setDropETA(el);
    }

    var diffTime = Math.round((ETA - Date.now()) / 1000);

    if (diffTime < 0) {
      clearInterval(saleTimerUpdate);
      diffTime = 0;
      saleBlock.fadeOut();
    }

    updateTimer(diffTime, elDays, elHours, elMinutes);

    if (!saleTimerShown) {
      saleTimerShown = true;
      activeTimer.fadeIn('fast');
    }
  }

  function updateTimer(seconds, daysEl, hoursEl, minutesEl) {
    var parsedTime = secondsToTimer(seconds);
    daysEl.text(parsedTime[0]);
    hoursEl.text(parsedTime[1]);
    minutesEl.text(parsedTime[2]);
  }

  function secondsToTimer(seconds) {
    seconds = seconds * 1000;
    var d = Math.floor(seconds / (1000 * 60 * 60 * 24));
    var h = Math.floor(seconds % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    var m = Math.floor(seconds % (1000 * 60 * 60) / (1000 * 60));
    var s = Math.floor(seconds % (1000 * 60) / 1000);
    return [d, h, m, s];
  } // support of anchors in button of share timer


  if (elSaleButton.length && elSaleButton.data('anchor')) {
    elSaleButton.on('click', function (e) {
      e.preventDefault();
      var targetSelector = $(this).data('anchor');
      var target = $(targetSelector);
      target = target.length ? target : $('[name=' + targetSelector.slice(1) + ']'); // support for native anchors

      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top - 50
        }, 400);
        return false;
      }
    });
  }
  /**
   * Limited Case Timer
   */


  var limitedTimerCases = $('.limited-cases .case-item');
  limitedTimerCases.each(function () {
    var elWithTimer = $(this).find($('.js-time-remain'));
    var limitedCaseTimeRemains = null;

    if ($(elWithTimer).length) {
      limitedCaseTimeRemains = $(elWithTimer).data('remain');

      if (limitedCaseTimeRemains <= 0) {
        $(this).remove();
      }

      timerAddElements(secondsToTimer(limitedCaseTimeRemains), $(this), '.time-case__count', '.time-case__units');
      limitedCasesUpdateTimer(limitedCaseTimeRemains, $(this));
    }
  });

  function limitedCasesUpdateTimer(dataRemains, element) {
    var timer = setInterval(function () {
      var diffTime = dataRemains--;
      var dataArray = secondsToTimer(diffTime);

      if (diffTime <= 0) {
        clearInterval(timer);
        $(element).addClass('noactive');
        $(element).remove();
      }

      timerAddElements(dataArray, element, '.time-case__count', '.time-case__units');
    }, 1000);
  }

  function timerAddElements(dataArray, element, timerClass, textClass) {
    var days = dataArray[0];
    var hours = addZero(dataArray[1]);
    var minutes = addZero(dataArray[2]);
    var seconds = addZero(dataArray[3]);

    if ($(element).find($(timerClass))) {
      if (days > 0) {
        $(element).find($(timerClass)).text(days);

        if (days > 2) {
          $(element).find($(textClass)).text('days');
        } else {
          $(element).find($(textClass)).text('day');
        }
      } else {
        $(element).find($(timerClass)).text(hours + ':' + minutes + ':' + seconds);
        $(element).find($(textClass)).text('');
      }
    }
  }
  /**
   * Move knifes in social banner on hover
   */


  var socialBanner = $('.social-banner-wrapper');
  var knife1 = $('.social-banner__knife1');
  var knife2 = $('.social-banner__knife2');
  var knife3 = $('.social-banner__knife3');
  var socialAnimationVals = {
    base: null,
    client: null,
    needToSmooth: false
  };
  setDefaultAnimationVals();

  function setDefaultAnimationVals() {
    var width = socialBanner.outerWidth();
    var offset = socialBanner.offset();
    offset.left += width / 2; // center of the banner

    socialAnimationVals.base = offset;
    socialAnimationVals.client = offset;
  }

  function updateCurrentClient(e) {
    var realPosition = {
      left: e.clientX,
      top: e.clientY
    };
    var needToSmooth = socialAnimationVals.needToSmooth;
    socialAnimationVals.client = needToSmooth ? smoothClientPosition(realPosition) : realPosition;
  }

  function smoothClientPosition(realPosition) {
    var movePortion = 0.075;
    var minMove = 2;
    var oldPosition = socialAnimationVals.client;
    var diff = Math.abs(realPosition.left - oldPosition.left);

    if (diff < minMove) {
      socialAnimationVals.needToSmooth = false;
      return realPosition;
    }

    return {
      left: oldPosition.left * (1 - movePortion) + realPosition.left * movePortion,
      top: oldPosition.top * (1 - movePortion) + realPosition.top * movePortion
    };
  }

  function enableClientSmoothing() {
    socialAnimationVals.needToSmooth = true;
  }

  function moveKnifes(e) {
    updateCurrentClient(e);
    var base = socialAnimationVals.base;
    var client = socialAnimationVals.client;
    var moveX = base.left - client.left;
    var moveY = base.top - client.top;
    setKnifeOffset(moveX, moveY);
  }

  function setKnifeOffset(offsetX, offsetY) {
    knife1.css('transform', 'translateX(' + offsetX / 80 + 'px) translateY(' + offsetY / 80 + 'px)');
    knife2.css('transform', 'translateX(' + offsetX / 100 + 'px) translateY(' + offsetY / 100 + 'px)');
    knife3.css('transform', 'translateX(' + offsetX / 120 + 'px) translateY(' + offsetY / 120 + 'px)');
  }

  socialBanner.on('mousemove', moveKnifes);
  socialBanner.on('mouseenter', enableClientSmoothing);
  socket.on('case_update', function (data) {
    updateCaseQuantity(data.currentQuantity, '.limited-item a[data-id="' + data.caseId + '"] .left-items');
  });
  timer($('.youparty-banner__time-remain').data('timestamp'), '.youparty-banner__time-remain', function (eta, el) {
    $(el).find('.days span').text(eta.d);
    $(el).find('.hours span').text(eta.h);
    $(el).find('.mins span').text(eta.m);
  })();
});