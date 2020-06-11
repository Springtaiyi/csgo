"use strict";

var AnimationTimeInProfile = 300;

function animateNewHeight(wrapper, oldHeight) {
  wrapper.height('auto');
  var newHeight = wrapper.innerHeight();
  wrapper.innerHeight(oldHeight).animate({
    height: newHeight
  }, AnimationTimeInProfile, function () {
    wrapper.height('');
  });
}

function appendNewItemsInProfile(itemsWrap, items, isToggleStatusBtn) {
  // Fix old height
  var oldHeight = itemsWrap.innerHeight();

  if (isToggleStatusBtn) {
    itemsWrap.empty();
  } // Insert items


  items.forEach(function (el) {
    var elem = $(el).css({
      opacity: 0
    }).addClass('needToShow');
    itemsWrap.append(elem);
  });
  animateNewHeight(itemsWrap, oldHeight); // Show new items

  itemsWrap.find('.needToShow').removeClass('needToShow').delay(AnimationTimeInProfile).animate({
    opacity: 1
  }, AnimationTimeInProfile, function () {
    $(this).css('opacity', 'unset');
  });
}

function upgradeLoadMoreBtn(btn, itemsWrapper, newItemCount) {
  var parent = btn;

  if (newItemCount) {
    parent.data('total', newItemCount);
  }

  var totalCount = Number(parent.data('total')); // Update counter

  var curCount = itemsWrapper.children().length;

  if (curCount >= totalCount) {
    btn.addClass('hidden-button');
  }
}

function restoreBtn(btn) {
  btn.removeClass('loading');
}

$(function () {
  var userId = $('.my_profile').data('id') || $('.profile-page').data('id');
  var loadingItems = false;
  $('.main-button.more.drops').on('click', function () {
    if (loadingItems) {
      return;
    }

    loadingItems = true;
    var isItemsActive = $('#available-for-sale').prop('checked') ? 1 : 0;
    var btn = $(this);
    var lastId = $('.items-grid .loot-item').last().data('id');
    btn.addClass('loading');
    ajaxQuery({
      url: '/users-drop/load-more',
      data: {
        userId: userId,
        lastDropId: lastId,
        is_active: isItemsActive
      }
    }).done(function (data) {
      if (data.status === 'success') {
        var itemsWrap = $('.items-grid:not(.content-wrap_steps)');
        appendNewItemsInProfile(itemsWrap, data.items);
        upgradeLoadMoreBtn(btn, itemsWrap);
      } else {
        showAjaxAnswer(data);
      }
    }).always(function () {
      loadingItems = false;
      restoreBtn(btn);
    });
  });

  function loadMoreUpgradeItems() {
    if (loadingItems) {
      return;
    }

    loadingItems = true;
    var btn = $('.button-load-more.upgrades');
    var lastId = $('.upgrade-grid .upgraded-item') ? $('.upgrade-grid .upgraded-item').last().data('id') : 0;
    btn.addClass('loading');
    ajaxQuery({
      url: '/upgrade/default/load-more',
      data: {
        userId: userId,
        lastUpgradeId: lastId
      }
    }).done(function (data) {
      if (data.status === 'success') {
        var itemsWrap = $('.upgrade-grid:not(.content-wrap_steps)');
        appendNewItemsInProfile(itemsWrap, data.items, false);
        upgradeLoadMoreBtn(btn, itemsWrap);
        toggleShowAllUpgraded();
      }
    }).always(function () {
      loadingItems = false;
      restoreBtn(btn);
    });
  }

  ;
  $(document).on('click', '.upgraded-item__show-all-btn', function () {
    var upgradedItem = '.upgraded-item';
    var closestUpgradedItem = $(this).closest(upgradedItem);

    if (closestUpgradedItem.hasClass('showed')) {
      closestUpgradedItem.removeClass('showed');
    } else {
      $(upgradedItem).removeClass('showed');
      closestUpgradedItem.addClass('showed');
    }

    ;
  });
  $('.main-button.more.upgrades').on('click', function () {
    loadMoreUpgradeItems();
  });
  var toggleShowAllUpgraded = debounce(function () {
    var items = $('.upgrade-grid .upgraded-item');
    $(items).each(function (_i, elem) {
      var el = $(elem);

      if (el.find('.upgraded-item__items').height() > el.height()) {
        el.addClass('show-button');
      } else {
        el.removeClass('show-button showed');
      }
    });
  }, 250);
  $(window).on('load resize', toggleShowAllUpgraded); //Tabs functionality

  function initTab(tabEl, filterEl, cb) {
    var eventName = 'sc-tab-filter';
    var tabName = '.tab';
    $(tabEl).on('click', tabName, function (e) {
      e.preventDefault();

      var _this = $(this);

      var activeClass = 'active';

      if (!_this.hasClass(activeClass)) {
        var dataFilter = _this.data('sc-filter');

        _this.parent().find(tabName).removeClass(activeClass);

        $(filterEl).trigger(eventName, {
          filterType: dataFilter
        });

        _this.addClass(activeClass);
      }
    });
    $(filterEl).on(eventName, function (_e, data) {
      var filterType = data.filterType;
      cb(filterType);
    });
  }

  ;
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

  var alreadyOpenedUpgradeTab = false;
  initTab('.actions-tabs', '.show-content', function (filterType) {
    var innerBlock = '.show-content .show-block';
    var items = $(innerBlock);
    var hiddenClass = 'hidden';
    items.each(function () {
      var _this = $(this);

      var itemType = _this.data('item-type');

      if (itemType !== filterType) {
        _this.addClass(hiddenClass);
      } else {
        _this.removeClass(hiddenClass);
      }
    });

    if (filterType === 'events') {
      $('.actions-wrapper .actions').addClass('hidden');
      $(document).trigger('sc-init-counter', {
        element: '.point-wrapper .count',
        duration: 500
      });
    } else if (filterType === 'cases') {
      $('.actions-wrapper .actions').removeClass('hidden');
    } else if (filterType === 'upgrades') {
      if (!alreadyOpenedUpgradeTab) {
        loadMoreUpgradeItems();
        alreadyOpenedUpgradeTab = true;
      }
    }
  });
});