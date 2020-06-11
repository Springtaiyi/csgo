"use strict";

/* eslint-disable */
// $(function() {
//     var timer = document.querySelector('.time-remain');
//
//     function getTime(el) {
//         var remainTime = parseInt(el.dataset.remain);
//
//         var time = new Date();
//         var currentTime = new Date();
//         time.setTime(remainTime * 1000);
//
//         var diffTime = time - currentTime;
//
//         timeToTimer(diffTime);
//     }
//
//     function timeToTimer(time) {
//         var days = addZero(Math.floor(time / (1000 * 60 * 60 * 24)));
//         var hours = addZero(Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
//         var minutes = addZero(Math.floor((time % (1000 * 60 * 60)) / (1000 * 60)));
//         var seconds = addZero(Math.floor((time % (1000 * 60)) / 1000));
//
//         document.querySelector('.time-remain__days p').innerHTML = hours;
//         document.querySelector('.time-remain__hours p').innerHTML = minutes;
//         document.querySelector('.time-remain__mins p').innerHTML = seconds;
//     }
//
//     setInterval(function() {
//         getTime(timer);
//     }, 1000);
// });
var captchaResponse = null;

function caseSubscribe(response) {
  captchaResponse = response;
  window.tryToSubscribe();
}

function clearCaptchaResponse() {
  captchaResponse = null;
  window.hideCaptchaBlock();
}

$(function () {
  /**
     * Timer
     */
  var subscribeBtn = $('.tp__link');
  var qActiveTimer = $('.time-remain');
  var elHours = $('.time-remain__days p');
  var elMinutes = $('.time-remain__hours p');
  var elSeconds = $('.time-remain__mins p');
  setDropETA(qActiveTimer);
  cdUpdateTime(qActiveTimer);
  var shareTimerUpdate = setInterval(function () {
    cdUpdateTime(qActiveTimer);
  }, 1000);

  function cdUpdateTime(el) {
    var ETA = el.data('ETA');

    if (!ETA) {
      ETA = setDropETA(el);
    }

    var diffTime = Math.round((ETA - Date.now()) / 1000);

    if (diffTime < 0) {
      subscribeBtn.attr('disabled', 'disabled');
      clearInterval(shareTimerUpdate);
      diffTime = 0;
    }

    secondsToTimer(diffTime);
  }

  function setDropETA(el) {
    var remainingSeconds = el.data('remain');
    var elapseTime = new Date();
    elapseTime.setTime(Date.now() + remainingSeconds * 1000);
    el.data('ETA', elapseTime.getTime());
    return elapseTime;
  }

  function secondsToTimer(seconds) {
    var h = addZero(Math.floor(seconds / 3600));
    var m = addZero(Math.floor(seconds / 60 % 60));
    var s = addZero(seconds % 60);
    elHours.text(h);
    elMinutes.text(m);
    elSeconds.text(s);
  }
  /**
     * Subscribe
     */


  var registerTemplate;
  var registerUsersTotal = $('.title h2 span');
  var lastUsers = $('.last-users-wrapper');
  var captchaBlock = $('.subscribe_captcha');

  if ($('#new_participant_tpl').length) {
    registerTemplate = _.template($('#new_participant_tpl').html());
  }

  var view = window.viewData;
  var caseId = view.caseId;
  var beforeSubscribeDiv = $('.giveaway-case__take-part');
  beforeSubscribeDiv.on('click', '.tp__link ', function () {
    if (subscribeBtn.is(':disabled')) {
      return;
    }

    if (captchaBlock.length > 0 && captchaResponse === null) {
      captchaBlock.show();
      return;
    }

    tryToSubscribe();
  });

  window.tryToSubscribe = function () {
    ajaxQuery({
      url: '/cases/subscribe-giveaway',
      data: {
        caseId: caseId,
        captcha: captchaResponse
      }
    }).done(function (data) {
      showAjaxAnswer(data);
      subscribeBtn.attr('disabled', 'disabled');

      if (data.status === 'success') {
        var user = data.user;
        var sub = data.subscription;
        var info = {
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatar,
          timeRegister: sub.created_at.slice(0, -3)
        };
        incTextNumber(registerUsersTotal);
        lastUsers.prepend(registerTemplate(info));
        lastUsers.children().slice(24).remove();
      }
    }).always(function () {
      hideCaptchaBlock();
    });
  };

  window.hideCaptchaBlock = function () {
    captchaBlock.hide();
  };
});
/* eslint-enable */