"use strict";

$(function () {
  var pointsEl = $('.points-collected-block');
  var isAnimationFired = false;

  var triggerAnimation = function triggerAnimation() {
    if (pointsEl.length) {
      if (pointsEl.isInViewport()) {
        if (!isAnimationFired) {
          isAnimationFired = true;
          $(document).trigger('sc-init-counter', {
            element: '.points-collected-block .counter',
            duration: 1000
          });
        }
      }
    }
  };

  triggerAnimation();
  $(window).on('resize scroll', triggerAnimation);
  var errorModal = $('#modal-error');
  var confirmationModal = $('#modal-confirmation');
  var userEventPoints = $('.points-block .points-count').data('user-points');
  parseFloat($('.header-profile-user__balance span').first().text().replace(/[^0-9.-]+/g, ''));
  var dialogOpenObject = {
    url: '',
    price: null,
    type: '',
    modalImg: '',
    itemTitle: ''
  };
  $('.filter-grid').on('click', '.case-link', function (e) {
    e.preventDefault();

    var _this = $(this);

    var url = _this.data('href');

    url = url.slice(3, url.length);
    dialogOpenObject.url = url;
    var price = $(this).find('.item-price[data-item-price]').data('item-price');
    dialogOpenObject.price = price;
    var type = $(this).closest('.case-item').data('item-type');
    dialogOpenObject.type = type;

    var modalImg = _this.find('.image-wrapper img').clone();

    dialogOpenObject.modalImg = modalImg;
    confirmationModal.find('.buing-item').removeClass().addClass('buing-item').html(modalImg);

    var itemTitle = _this.find('.title').clone();

    dialogOpenObject.itemTitle = itemTitle;
    confirmationModal.attr('type', type);

    var isGiveaway = _this.find('.button-regular').data('url');

    isGiveaway = isGiveaway === 'undefined' || isGiveaway === undefined ? false : isGiveaway;

    if (isGiveaway) {
      window.location.assign(isGiveaway);
      return false;
    }

    if (type === 'money') {
      confirmationModal.find('.buing-item img').css({
        transform: 'scale(0.9)'
      });
    } else if (type === 'item') {
      var viewnClass = _this.attr('class');

      confirmationModal.find('.buing-item img').css({
        transform: 'scale(0.6)'
      }).parent().addClass(viewnClass);
    }

    confirmationModal.find('.balance').html(itemTitle);
    confirmationModal.find('.error').hide();
    confirmationModal.find('.action-wrapper .button span.points').html(price);
    confirmationModal.modal();
  });
  $('#modal-confirmation').on('click', '.button-upgrade', function (e) {
    e.preventDefault();

    if ($.modal.isActive()) {
      ajaxQuery({
        url: dialogOpenObject.url,
        complete: function complete(res) {
          var answer = res.responseJSON;

          if (answer.status === 'success') {
            $.modal.close();
            userEventPoints = userEventPoints - dialogOpenObject.price;
            $('.points-block .points-count').html(userEventPoints);

            if (answer.entity_type === 'money') {
              userBalance.change(answer.added);
              showAlert('success', answer.msg);
            }

            if (answer.entity_type === 'item') {
              showAlert('success', answer.msg);
            }

            if (answer.entity_type === 'case') {
              showAlert('success', answer.msg, {
                buttons: [Noty.button('Open case', 'btn btn-primary btn-sm', function () {
                  window.location.href = answer.caseFrontendUrl + '#to_roulette';
                }), Noty.button('Later', 'btn btn-danger btn-sm', function () {
                  Noty.closeAll();
                })]
              });
            }
          } else {
            $.modal.close();
            errorModal.find('.balance').html(dialogOpenObject.itemTitle);
            errorModal.find('.buing-item').html(dialogOpenObject.modalImg);
            errorModal.find('.error').html(answer.msg);
            errorModal.modal();
          } //Show popup or notifycation

        }
      });
    }
  });
  $('#modal-error').on('click', '.button-upgrade', function (e) {
    e.preventDefault();

    if ($.modal.isActive()) {
      $.modal.close();
      $('html, body').animate({
        scrollTop: $('#event-cases').offset().top
      }, 500);
    }
  });
  var newYearActiveTimer = $('.youparty-banner__time-remain');
  var newYearElDays = newYearActiveTimer.find('.days span');
  var newYearElHours = newYearActiveTimer.find('.hours span');
  var newYearElMinutes = newYearActiveTimer.find('.mins span'); // var newYearExchangeButton = newYearBanner.find('.points-exchange');

  var newYearEventEndsTimestamp = $(newYearActiveTimer).data('timestamp'); // var newYearShopClosesTimestamp = $(newYearActiveTimer).data('shopactive');

  bannerTimer(secondsToTimer(newYearEventEndsTimestamp), newYearElDays, newYearElHours, newYearElMinutes);
  var newYearTimer = bannerCountDown(newYearTimer, newYearEventEndsTimestamp, newYearElDays, newYearElHours, newYearElMinutes);

  function bannerCountDown(timerEl, timerEndsTimestamp, daysEl, hoursEl, minutesEl) {
    timerEl = setInterval(function () {
      var diffTime = timerEndsTimestamp--;
      var dataArray = secondsToTimer(diffTime);

      if (diffTime <= 0) {
        clearInterval(timerEl); //window.location.reload();
      }

      bannerTimer(dataArray, daysEl, hoursEl, minutesEl);
    }, 1000);
  }

  function bannerTimer(dataArray, daysEl, hoursEl, minutesEl) {
    var days, hours, minutes;

    if (dataArray.length) {
      days = addZero(dataArray[0]);
      hours = addZero(dataArray[1]);
      minutes = addZero(dataArray[2]);
    }

    $(daysEl).text(days);
    $(hoursEl).text(hours);
    $(minutesEl).text(minutes);
  }

  function secondsToTimer(seconds) {
    seconds = seconds * 1000;
    var d = Math.floor(seconds / (1000 * 60 * 60 * 24));
    var h = Math.floor(seconds % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    var m = Math.floor(seconds % (1000 * 60 * 60) / (1000 * 60));
    var s = Math.floor(seconds % (1000 * 60) / 1000);
    return [d, h, m, s];
  }

  $('.feast-wrapper .menu-block li a').click(function (event) {
    event.preventDefault();
    var href = $(this).attr('href');

    if (href && href.length) {
      scrollSmoothlyTo(href);
    }
  });
  var tabsHolder = $('.tabs-wrapper'),
      filterEl = '.filter-grid';

  var eventFilterCb = function eventFilterCb(filterType) {
    var innerBlock = '.case-item';
    var items = $(filterEl + ' ' + innerBlock);
    var hiddenClass = 'hidden';

    if (filterType !== 'all') {
      items.each(function () {
        var _this = $(this);

        var itemType = _this.data('item-type');

        if (itemType !== filterType) {
          _this.addClass(hiddenClass);
        } else {
          _this.removeClass(hiddenClass);
        }
      });
    } else {
      items.removeClass(hiddenClass);
    }
  };

  initTab(tabsHolder, filterEl, eventFilterCb);
});