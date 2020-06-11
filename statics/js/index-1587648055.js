"use strict";

var tickSound = null;
var timeToPlay = 30;
var canPlaymusic = true;

function soundCb() {
  canPlaymusic = false;
  setTimeout(function () {
    canPlaymusic = true;
  }, timeToPlay);
}

window.addEventListener('load', function () {
  function isAsClose(value, target, precision) {
    return Math.abs(value - target) <= precision;
  }

  function scrollToUpgradeRoulette() {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      $('html, body').animate({
        scrollTop: $('.upg-center__roulette').offset().top - 100
      }, 1000);
    }
  }

  $.fn.animateRotate = function (angle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step; //eslint-disable-next-line no-unused-vars

    return this.each(function (i, e) {
      args.complete = $.proxy(args.complete, e);

      args.step = function (now) {
        $.style(e, 'transform', 'rotate(' + now + 'deg)');
        if (step) return step.apply(e, arguments);
      };

      $({
        deg: 0
      }).animate({
        deg: angle
      }, args);
    });
  }; //eslint-disable-next-line no-unused-vars


  var listComponent = Vue.component('items-list-component', {
    props: ['items', 'single', 'disabled', 'pagination', 'selected'],
    template: '#vue-component-item-list',
    data: function data() {
      return {
        items: this.items,
        lastSelect: null,
        single: this.single || false,
        selected: this.selected,
        isDisabled: this.disabled || false,
        pagination: this.pagination,
        winStatus: this.winStatus
      };
    },
    created: function created() {
      this.singleEvents();
    },
    methods: {
      singleEvents: function singleEvents() {
        if (!this.single) return;
        this.$root.$on('removeForUpgrade', function () {
          this.selected = null;
          this.$emit('selected', this.selected);
        }.bind(this));
      },
      isClickedInfo: function isClickedInfo(element) {
        return $(element).closest('.upg__help-toolTip').length > 0;
      },
      select: function select(item, event) {
        if (this.isClickedInfo(event.target)) return;
        if (this.disabled) return;

        if (this.single) {
          this.singleSelect(item);
        } else {
          this.multiSelect(item);
        }
      },
      singleSelect: function singleSelect(item) {
        if (this.isSelected(item)) return;
        this.selected = item;
        this.$emit('selected', this.selected);
      },
      multiSelect: function multiSelect(item) {
        if (this.isSelected(item)) return;
        this.selected.push(item);
        this.$emit('selected', this.selected);
      },
      remove: function remove(item, $event) {
        $event.stopPropagation();
        if (this.disabled) return;

        if (this.single) {
          this.selected = null;
        } else {
          for (var i = 0; i < this.selected.length; i++) {
            if (this.selected[i].id === item.id) {
              this.selected.splice(i, 1);
              break;
            }
          }
        }

        this.$emit('selected', this.selected);
      },
      isSingleSelected: function isSingleSelected(item) {
        if (this.selected && this.selected.id === item.id) {
          return true;
        }

        return false;
      },
      isMultiSelected: function isMultiSelected(item) {
        for (var i = 0; i < this.selected.length; i++) {
          if (this.selected[i].id === item.id) {
            return true;
          }
        }

        return false;
      },
      isSelected: function isSelected(item) {
        if (this.single) {
          return this.isSingleSelected(item);
        }

        return this.isMultiSelected(item);
      }
    }
  });
  Vue.component('pagination-component', {
    props: ['current', 'top'],
    template: '#vue-component-pagination'
  });
  Vue.component('upgradable-selected-component', {
    props: ['disabled', 'items', 'possibleItems'],
    template: '#vue-component-selected',
    data: function data() {
      return {
        current: 0,
        styleActiveNav: 'opacity: 1; visibility: visible;',
        styleDisableNav: 'opacity: 0; visibility: hidden;',
        disabled: this.disabled || false,
        user: {
          isGuest: viewData.general.user.isGuest
        }
      };
    },
    created: function created() {
      this.$watch('items', function () {
        this.current = this.items.length - 1;
      }.bind(this));
    },
    methods: {
      paginationLeft: function paginationLeft() {
        if (this.current - 1 < 0) {
          this.current = this.items.length - 1;
          return;
        }

        this.current--;
      },
      paginationRight: function paginationRight() {
        if (this.current + 1 > this.items.length - 1) {
          this.current = 0;
          return;
        }

        this.current++;
      },
      getProp: function getProp(prop) {
        if (!this.items.length) return '';
        return this.items[this.current][prop];
      },
      getSum: function getSum() {
        if (!this.items.length) return 0;
        var sum = 0;

        for (var i = 0; i < this.items.length; i++) {
          sum += parseFloat(this.items[i].price);
        }

        return sum.toFixed(2);
      },
      declineCount: function declineCount() {
        return this.items.length + ' ' + declineCountable(this.items.length, ['item', 'items']);
      },
      remove: function remove() {
        if (this.disabled) return;
        this.items.splice(this.current, 1);
      },
      removeAll: function removeAll() {
        if (this.disabled) return;
        this.items.splice(0, this.items.length);
      },
      pickAll: function pickAll() {
        //var pickedItem = getRandItem(this.possibleItems);
        this.$emit('selected', this.possibleItems);
      },
      pickRandom: function pickRandom() {
        this.$emit('selected', [this.possibleItems[Math.floor(Math.random() * this.possibleItems.length)]]);
      }
    },
    computed: {
      isSelectItemsButtonDisabled: function isSelectItemsButtonDisabled() {
        return !this.possibleItems.length;
      }
    }
  }); //eslint-disable-next-line no-unused-vars

  var upgradeApp = new Vue({
    el: '#vue-upgrade-app',
    data: {
      isUpgrading: false,
      "const": {
        CUSTOM_PRICE: 1.2,
        TIME_DISABLED: 2000
      },
      isLoad: false,
      isRandomActive: false,
      user: {
        balance: 0,
        isGuest: null
      },
      config: {
        factor: {
          value: -1,
          data: {
            '1.5x': 1.5,
            '2x': 2,
            '5x': 5,
            '10x': 10,
            '20x': 20
          }
        },
        balance: {
          $modal: $('.open_balance_modal'),
          min: 5,
          max: 1000,
          value: 5,
          isActive: false,
          styleActive: 'opacity: 1;',
          styleDisable: 'opacity: 0.5;'
        },
        invert: false
      },
      upgradable: {
        data: [],
        order: 'desc',
        pagination: {
          countItems: 12,
          current: 1,
          top: 1
        },
        // values
        selectedSkins: [],
        orderPrice: true
      },
      forUpgradable: {
        data: [],
        pagination: {
          countItems: 12,
          current: 1,
          count: 0
        },
        // toggles btns
        searchToggle: false,
        filtersToggle: false,
        // values
        selectedSkin: null,
        orderPrice: false,
        quality: -1,
        priceMin: null,
        priceMax: null,
        searchName: ''
      },
      upgradeCircle: {
        element: null,
        canvas: null,
        active: false,
        percentsPortion: 0,
        percentsDisplay: Number(0).toFixed(2)
      },
      textBasedOnPercents: '',
      viewnSuffix: '',
      addedItemImgSuffix: '',
      winItem: {
        show: false,
        data: {}
      },
      opacity: {
        visible: 'opacity: 1; visibility: visible;',
        hidden: 'opacity: 0; visibility: hidden;'
      },
      showPrize: false,
      animateCenter: false,
      qualities: {
        All: -1,
        Consumer: 0,
        Industrial: 1,
        Milspec: 2,
        Restricted: 3,
        Classified: 4,
        Covert: 5,
        Knife: 6
      },
      soundType: viewData.soundsType
    },
    created: function () {
      this.viewnSuffix = viewData.viewnSuffix;
      this.addedItemImgSuffix = viewData.addedItemImgSuffix;
      this.cdnUrl = viewData.aliases.cdn;
      this.upgradable.data = viewData.upgradableDrops;
      this.forUpgradable.data = viewData.itemsForUpgrade.data;
      this.forUpgradable.pagination.count = viewData.itemsForUpgrade.count;
      this.user.balance = viewData.general.user.balance / 100;
      this.user.isGuest = viewData.general.user.isGuest;
      this.$watch('config.balance.isActive', this.changeStateBalance);
      this.$watch('upgradable.data', this.countPageUpgradableUpdate);
      this.$watch('config.balance.value', debounce(this.getItemsByUserBalance, 100));
      this.$watch('forUpgradable.selectedSkin', function (newValue, oldValue) {
        if (!newValue && this.upgradable.selectedSkins.length) {
          var sum = this.getUpgradableSum();

          if (sum * this["const"].CUSTOM_PRICE > oldValue.price) {
            this.getFilterItemsByConfig();
          }
        }
      });
      this.$watch('upgradable.data', function () {
        this.updateSelectedSkins();
        this.fixUpgradableLastPagePagination();
      });
      this.utils().watchList(['config.factor.value', 'config.balance.value', 'upgradable.selectedSkins'], debounce(this.actionGetRandomItemByPrice, 100));
      this.utils().watchList(['forUpgradable.priceMin', 'forUpgradable.priceMax'], this.getItemsByPriceDrop);
      this.utils().watchList(['forUpgradable.selectedSkin', 'upgradable.selectedSkins', 'config.balance.value', 'config.balance.isActive'], this.calcCirclePercents);
      this.$watch('config.invert', this.revertCircleProgress);
      this.utils().watchList(['forUpgradable.quality', 'forUpgradable.searchName', 'forUpgradable.orderPrice'], debounce(function () {
        this.forUpgradable.pagination.current = 1;
        this.getFilterItemsByConfig();
      }, 300));
      this.utils().watchList(['forUpgradable.priceMin', 'forUpgradable.priceMax'], debounce(function () {
        this.forUpgradable.pagination.current = 1;

        if (!this.forUpgradable.priceMin && !this.forUpgradable.priceMax) {
          return;
        }

        this.getFilterItemsByConfig();
      }, 300));
      this.utils().watchList(['forUpgradable.orderPrice'], debounce(function () {
        this.getFilterItemsByConfig();
      }, 300));
      this.$nextTick(function () {
        this.configureAfterInit();
        this.isLoad = true;
      });
      document.addEventListener('visibilitychange', debounce(function () {
        if (!document.hidden && !this.isRandomActive && !this.user.isGuest) {
          this.actionRefresh();
        }
      }, 600).bind(this), false);
      this.countPageUpgradableUpdate();
      this.selectDrop(null, this.getFilterItemsByConfig);
    },
    computed: {
      computedMaxBalance: function computedMaxBalance() {
        if (this.config.balance.max <= 250) {
          return 1000;
        }

        return this.config.balance.max * 4;
      },
      computedTextBaseOnChance: function computedTextBaseOnChance() {
        if (this.upgradeCircle && this.upgradeCircle.percentsDisplay) {
          if (this.upgradeCircle.percentsDisplay > 50) {
            this.textBasedOnPercents = 'High chance';
          } else if (this.upgradeCircle.percentsDisplay < 50 && this.upgradeCircle.percentsDisplay > 20) {
            this.textBasedOnPercents = 'Average chanсe';
          } else {
            this.textBasedOnPercents = 'Risky chanсe';
          }
        }

        return this.textBasedOnPercents;
      },
      isUpgradeDisabled: function isUpgradeDisabled() {
        return !(this.forUpgradable.selectedSkin && this.upgradable.selectedSkins.length) || this.user.isGuest;
      }
    },
    mounted: function mounted() {
      let user = JSON.parse(window.sessionStorage.getItem('user'));
      axios.post('http://121.36.199.219:8080/players/selectPlayerArms',{id: user.id, isStatus: 0}).then( (response) => {
        this.upgradable.data = response.data.body.armsList;
      });
      this.initCirclePercents();
    },
    methods: {
      http: function http() {
        return {
          upgradeBySkins: function upgradeBySkins(jilv, oldArms, newArms, playerId) {
            return axios.post('http://121.36.199.219:8080/upgrading/shengji',{
              jilv: jilv,
              oldArms: oldArms,
              newArms: newArms,
              playerId: playerId
            });
          },
          upgradeByBalance: function upgradeByBalance(payedSum, upgradingTo, itemPrice) {
            return ajaxQuery({
              url: '/upgrade/api/balance',
              data: {
                payed_sum: payedSum,
                upgrading_to: upgradingTo,
                item_price: itemPrice
              }
            });
          },
          getFilteredItems: function getFilteredItems(data) {
            return axios.post('http://121.36.199.219:8080/upgrading/buybox',{
              // offset: data.offset,
              //   order_price: data['order_price'],
              //   price_max: data['price_max'],
              //   price_min: data['price_min'],
              //   search_name: data['search_name'],
              //   quality: data.quality,
              //   custom_modify_price: data['custom_modify_price'],
                info: data.info,
                ziduan: data.ziduan
            });
          },
          getRandomItemByPrice: function getRandomItemByPrice(priceMin, priceMax) {
            return ajaxQuery({
              url: '/upgrade/api/get-random-item-by-price',
              data: {
                price_max: priceMax,
                price_min: priceMin
              }
            });
          },
          refresh: function refresh() {
            // return ajaxQuery({
            //   url: '/upgrade/api/refresh'
            // });
          },
          sellDrop: function sellDrop(dropId) {
            axios.post('http://121.36.199.219:8080/playerBoxArms/updatePlayerBoxArms',{"id": dropId,"isStatus": 1}).then(function (response) {
              if (response.data.message == "success") {
                  let oldUser = JSON.parse(window.sessionStorage.getItem('user'));
                  axios.post('http://121.36.199.219:8080/players/selectPlayerArms',{id: oldUser.id}).then(function (response) {
                      oldUser.balance = response.data.body.balance;
                      window.sessionStorage.setItem('user', JSON.stringify(oldUser));
                      $('#account').text(oldUser.balance);
                      location.reload();
                      upgradeApp.removeAllUpgradable();
                      alert("售出成功!");
                  });
                  // location.reload();
              }else {
                  alert("售出失败!");
              }
              upgradeApp.toUpgrade();

            });
          }
        };
      },
      actionUpgrade: debounce(function () {
        this.isUpgrading = true;
        if (this.isRandomActive) return;
        scrollToUpgradeRoulette();

        if (this.config.balance.isActive && this.forUpgradable.selectedSkin) {
          this.upgradeByBalance();
        } else if (this.forUpgradable.selectedSkin && this.upgradable.selectedSkins.length) {
          this.upgradeBySkins();
        }
      }, 250, true),
      actionFilterItems: function actionFilterItems(priceMin, priceMax, searchName, quality, priceModifyPercents) {
        priceMax = priceMax || this.forUpgradable.priceMax;
        priceMin = priceMin || this.forUpgradable.priceMin;
        searchName = searchName || this.forUpgradable.searchName;
        quality = quality || this.forUpgradable.quality;
        priceModifyPercents = priceModifyPercents || 0; // convert to cents
        // priceMax = priceMax > 0 ? priceMax * 100 : 0;
        // priceMin = priceMin > 0 ? priceMin * 100 : 0; // check priceMin lower than priceMax
        // priceMax = priceMax < priceMin ? null : priceMax;
        this.http().getFilteredItems({
          info: {
            price: priceMin,
            fangshi: this.forUpgradable.orderPrice ? 'desc' : 'asc'
          },
          ziduan: 'price',
          offset: this.forUpgradable.pagination.current > 1 ? this.forUpgradable.pagination.countItems * (this.forUpgradable.pagination.current - 1) : 0,
          order_price: this.forUpgradable.orderPrice ? 'desc' : 'asc',
          price_max: priceMax,
          price_min: priceMin,
          search_name: searchName,
          quality: quality,
          custom_modify_price: priceModifyPercents
        }).then((response) => {
          this.forUpgradable.data = response.data.body;

          this.forUpgradable.pagination.total = response.data.total;
        });
      },
      actionGetRandomItemByPrice: function actionGetRandomItemByPrice() {
        var sum = 0;

        if (this.config.balance.isActive && this.config.factor.value === -1 && this.config.balance.value > 5) {
          return;
        } else if (!this.config.balance.isActive && (!this.upgradable.data.length || this.config.factor.value === -1)) {
          return;
        }

        if (this.config.balance.isActive) {
          sum = this.config.balance.value;
        } else {
          this.upgradable.selectedSkins.forEach(function (item) {
            sum += parseFloat(item.price);
          });
        }

        var factor = this.config.factor.value;
        var factorPrice = factor * sum * 100;
        var priceMin = (factorPrice - factorPrice * 0.05).toFixed(2);
        var priceMax = (factorPrice + factorPrice * 0.05).toFixed(2);
        this.http().getRandomItemByPrice(priceMin, priceMax).done(function (response) {
          this.forUpgradable.selectedSkin = response.data;

          if (!response.data && this.upgradable.selectedSkins.length) {
            return showAlert('warning', 'Item for "' + factor + 'x" multiplier not found');
          }
        }.bind(this));
      },
      actionRefresh: function actionRefresh() {
        this.http().refresh().done(function (response) {
          this.upgradable.orderPrice = true;
          this.$set(this.upgradable, 'data', response.drops);
          this.updateUserBalance(response.wallet);
        }.bind(this));
      },
      playMusic: function playMusic() {
        if (this.soundType === 'music') {
          $(document).trigger('sc-play-music', {
            type: 'upgrade'
          });
        } else {
          classicSoundSeq.startSound();
        }
      },
      upgradeBySkins: function upgradeBySkins() {
        var upgradeSkinsPrice = +this.getUpgradableSum();
        var resultItemPrice = +this.forUpgradable.selectedSkin.price;

        if (upgradeSkinsPrice > resultItemPrice) {
          return showAlert('warning', 'Upgrading items price must be less than price of desired item');
        }
        this.http().upgradeBySkins(this.upgradeCircle.percentsDisplay, this.getIdsSelectedSkins(), this.forUpgradable.selectedSkin.id, JSON.parse(window.sessionStorage.getItem('user')).id).then(this.handleUpgradeResult.bind(this));
      },
      upgradeByBalance: function upgradeByBalance() {
        if (+this.config.balance.value > +this.forUpgradable.selectedSkin.price) {
          return showAlert('warning', 'Upgradable sum must be less than price of desired item');
        }

        if (+this.user.balance < +this.config.balance.value) {
          return showAlert('warning', 'Not enough funds. You need $' + Math.ceil(+this.config.balance.value - +this.user.balance) + ' more');
        }

        var balanceCents = (this.config.balance.value * 100).toFixed();
        var itemPriceCents = (this.forUpgradable.selectedSkin.price * 100).toFixed();
        this.http().upgradeByBalance(balanceCents, this.forUpgradable.selectedSkin.id, itemPriceCents).done(this.handleUpgradeResult.bind(this));
      },
      handleUpgradeResult: function handleUpgradeResult(response) {
        var vm = this;
        if (response.data.message !== 'success') {
          // if ('item_price_changed' in response && response.item_price_changed) {
          //   this.updateItemWhenPriceChanged(response.item_price_changed);
          // }

          // return showAjaxAnswer(response);
          vm.animateCursor(90, true, function () {
            vm.showResultRulette(false, function () {
              alert(response.data.message);
            });
          });
        }else{
          if ('wallet' in response) {
            vm.updateUserBalance(response.wallet);
          }
          vm.isRandomActive = true;
          this.playMusic();
          vm.animateCursor(parseFloat(JSON.parse(response.config.data)['jilv']) * 0.4, true, function () {
            vm.showResultRulette(true, function () {
              vm.addWinDrop(response.data.body);
              // vm.addLiveDrop(response.live_drop);
            });
          });
        }

      },
      addLiveDrop: function addLiveDrop(tapeDrop) {
        if (socket.connected) {
          socket.emit('new_drop', {
            id: tapeDrop.drop.id,
            user_id: tapeDrop.user.id
          });
        } else {
          window.addLiveDrop(tapeDrop);
        }
      },
      disableForMoment: function disableForMoment() {
        this.isRandomActive = true;
        setTimeout(function () {
          this.isRandomActive = false;
        }.bind(this), this["const"].TIME_DISABLED);
      },
      updateItemWhenPriceChanged: function updateItemWhenPriceChanged(item) {
        var changedItem = item;
        this.$set(this.forUpgradable, 'selectedSkin', changedItem);
        var oldItem = this.forUpgradable.data.find(function (item) {
          return +item.id === +changedItem.id;
        });
        Object.assign(oldItem, changedItem);
        this.disableForMoment();
        var declineSeconds = declineCountable(this["const"].TIME_DISABLED / 1000, ['second', 'seconds']);
        showAlert('warning', 'After ' + this["const"].TIME_DISABLED / 1000 + ' ' + declineSeconds + ' forms will become active again, please, wait.');
      },
      updateSelectedSkins: function updateSelectedSkins() {
        var skinsIds = this.upgradable.data.map(function (item) {
          return +item.id;
        });

        for (var i = 0; i < this.upgradable.selectedSkins.length; i++) {
          if (skinsIds.indexOf(+this.upgradable.selectedSkins[i].id) === -1) {
            this.upgradable.selectedSkins.splice(i, 1);
          }
        }
      },
      utils: function utils() {
        return {
          watchList: function (props, watcher) {
            var iterator = function iterator(prop) {
              this.$watch(prop, watcher);
            };

            props.forEach(iterator, this);
          }.bind(this)
        };
      },
      selectDrop: function selectDrop(dropId, isSelectedCallback) {
        dropId = dropId || getUrlParameterByName('drop_id');
        if (!dropId || !this.upgradable.data.length) return;

        if (dropId === 'all') {
          this.selectAllDrop(this.upgradable.data);
        }

        var selectedItem = this.upgradable.data.find(function (item) {
          return +item.id === +dropId;
        });
        if (!selectedItem) return;
        this.upgradable.selectedSkins.push(selectedItem); //eslint-disable-next-line no-unused-expressions

        isSelectedCallback && isSelectedCallback();
      },
      selectAllDrop: function selectAllDrop(dropAll, isSelectedCallback) {
        var vm = this;

        if (dropAll.length) {
          dropAll.map(function (el) {
            vm.upgradable.selectedSkins.push(el);
          });
          this.forUpgradable.pagination.current = 1;
          this.getItemsByPriceDrop(); //eslint-disable-next-line no-unused-expressions

          isSelectedCallback && isSelectedCallback();
        }
      },
      configureAfterInit: function configureAfterInit() {
        // this.changeRangeColor();
        this.config.balance.max = this.user.balance;
      },
      // workers
      getFilterItemsByConfig: function getFilterItemsByConfig() {
        var isFiltered = false;

        if (this.config.balance.isActive) {
          isFiltered = this.getItemsByUserBalance();
        } else if (this.upgradable.selectedSkins.length) {
          isFiltered = this.getItemsByPriceDrop();
        }

        if (!isFiltered) {
          this.actionFilterItems();
        }
      },
      getItemsByPriceDrop: function getItemsByPriceDrop() {
        if (this.forUpgradable.priceMin || this.forUpgradable.priceMax || this.forUpgradable.searchName) {
          return false;
        }

        var customPrice = this.upgradable.selectedSkins.length ? this["const"].CUSTOM_PRICE : 0;
        this.actionFilterItems(this.getUpgradableSum(), null, null, null, customPrice);
        return true;
      },
      getItemsByUserBalance: function getItemsByUserBalance() {
        if (this.forUpgradable.priceMin || this.forUpgradable.priceMax || this.forUpgradable.searchName) {
          return false;
        }

        this.actionFilterItems(this.config.balance.value, null, null, null, this["const"].CUSTOM_PRICE);
        return true;
      },
      arrayColumn: function arrayColumn(arr, columnName) {
        return arr.map(function (item) {
          return item[columnName];
        });
      },
      removeParticipatingDrops: function removeParticipatingDrops() {
        var ids = this.arrayColumn(this.upgradable.selectedSkins, 'id');

        for (var i = 0; i < this.upgradable.data.length; i++) {
          if (ids.indexOf(this.upgradable.data[i].id) !== -1) {
            this.upgradable.data.splice(i, 1);
            i--;
          }
        }
      },
      addWinDrop: function addWinDrop(drop) {
        if (!drop) return;
        this.winItem.data = Object.assign({}, drop);
        this.upgradable.data.push(drop);
        this.selectDrop(drop.id);
        this.orderUpgradableItems();
      },
      toUpgrade: function toUpgrade() {
        this.winItem.show = false;
        this.winItem.data = {};
        location.reload();
      },
      sellDrop: function sellDrop() {
        var vm = this;
        var price = this.winItem.data.price;
        this.http().sellDrop(this.winItem.data.pbaId);
      },
      updateUserBalance: function updateUserBalance(balance) {
        this.user.balance = balance;
        this.config.balance.max = this.user.balance;
        userBalance.set(balance * 100); // this.changeRangeColor();
      },
      getItemsCount: function getItemsCount() {
        return Math.ceil(this.forUpgradable.pagination.count / this.forUpgradable.pagination.countItems);
      },
      itemsNextPage: function itemsNextPage() {
        if (this.forUpgradable.pagination.current < Math.ceil(this.forUpgradable.pagination.count / this.forUpgradable.pagination.countItems)) {
          this.forUpgradable.pagination.current++;
          this.getFilterItemsByConfig();
        }
      },
      countPageUpgradableUpdate: function countPageUpgradableUpdate() {
        this.upgradable.pagination.top = Math.ceil(this.upgradable.data.length / this.upgradable.pagination.countItems);
      },
      itemsPreviousPage: function itemsPreviousPage() {
        if (this.forUpgradable.pagination.current > 1) {
          this.forUpgradable.pagination.current--;
          this.getFilterItemsByConfig();
        }
      },
      upgradablePageCondition: function upgradablePageCondition(key) {
        if (key < this.upgradable.pagination.current * this.upgradable.pagination.countItems && key >= this.upgradable.pagination.current * this.upgradable.pagination.countItems - this.upgradable.pagination.countItems) {
          return true;
        }

        return false;
      },
      fixUpgradableLastPagePagination: function fixUpgradableLastPagePagination() {
        var pagination = this.upgradable.pagination;
        var maxPage = Math.ceil(this.upgradable.data.length / pagination.countItems);

        if (pagination.current > maxPage) {
          pagination.current = maxPage;
        }
      },
      nextPage: function nextPage() {
        var maxPage = Math.ceil(this.upgradable.data.length / this.upgradable.pagination.countItems);

        if (this.upgradable.pagination.current < maxPage) {
          this.upgradable.pagination.current++;
        }
      },
      previousPage: function previousPage() {
        if (this.upgradable.pagination.current > 1) {
          this.upgradable.pagination.current--;
        }
      },
      changeStateBalance: function changeStateBalance() {
        if (this.config.balance.isActive) {
          this.removeAllUpgradable();
          this.getItemsByUserBalance();
        }
      },
      openBalanceModal: function openBalanceModal() {
        this.config.balance.$modal.click();
      },
      changeFactor: function changeFactor(key) {
        if (this.isRandomActive) {
          return;
        }

        var factor = this.config.factor;
        factor.value = null;
        setTimeout(function () {
          factor.value = key;
        }, 20);
      },
      isActiveStyleBalance: function isActiveStyleBalance() {
        return this.config.balance.isActive && !this.isRandomActive ? this.config.balance.styleActive : this.config.balance.styleDisable;
      },
      changeRangeColor: function changeRangeColor() {
        var widthScrollBtn = 30;
        var percentsByMax = this.config.balance.value / this.computedMaxBalance * 100;
        var scrollBtnFix = widthScrollBtn * (100 - percentsByMax) / 100 - widthScrollBtn / 2;
        this.$refs.rangeColor.style.width = percentsByMax * this.$refs.rangeColorInput.clientWidth / 100 + scrollBtnFix + 'px';
      },
      getUpgradableSum: function getUpgradableSum() {
        var sum = 0;

        for (var i = 0; i < this.upgradable.selectedSkins.length; i++) {
          sum += parseFloat(this.upgradable.selectedSkins[i].price);
        }

        return sum.toFixed(2);
      },
      getPercentsSkins: function getPercentsSkins() {
        if (this.upgradable.selectedSkins.length && this.forUpgradable.selectedSkin) {
          return (this.getUpgradableSum() / this.forUpgradable.selectedSkin.price * 100).toFixed(2);
        }

        return 0;
      },
      getPercentsBalance: function getPercentsBalance() {
        if (!this.forUpgradable.selectedSkin) return 0;
        return (this.config.balance.value / this.forUpgradable.selectedSkin.price * 100).toFixed(2);
      },
      getPercentsAnimate: function getPercentsAnimate() {
        var percentsAnimate = this.config.balance.isActive ? this.getPercentsBalance() : this.getPercentsSkins();

        if (percentsAnimate > 80) {
          percentsAnimate = 80;
        }

        return percentsAnimate;
      },
      initCirclePercents: function initCirclePercents() {
        var vm = this;
        var element = $(this.$refs.circleProgress);
        element.circleProgress({
          animation: {
            duration: 1100,
            easing: 'circleProgressEasing'
          },
          // reverse: this.config.invert,
          size: 300,
          thickness: 50,
          startAngle: -Math.PI / 2,
          emptyFill: 'rgba(255, 255, 255, 0)',
          fill: {
            //color: 'rgba(0, 0, 0, 0)',
            image: './statics/image/circle-progress.svg'
          }
        }).on('circle-animation-progress', function (event, progress, stepValue) {
          if (vm.upgradeCircle.progressFn) {
            vm.upgradeCircle.progressFn(event, progress, stepValue);
          }
        }).on('circle-animation-end', function () {
          vm.upgradeCircle.active = false;
        });
        this.upgradeCircle.element = element;
        this.upgradeCircle.canvas = $(element.circleProgress('widget'));
      },
      revertCircleProgress: function revertCircleProgress() {
        var portion = this.upgradeCircle.percentsPortion;
        var element = this.upgradeCircle.element; // force progress function complete

        if (this.upgradeCircle.progressFn) {
          this.upgradeCircle.progressFn(null, 1, portion);
          this.upgradeCircle.progressFn = null;
        }

        element.circleProgress({
          reverse: this.config.invert,
          animationStartValue: portion
        });
        element.circleProgress();
      },
      calcCirclePercents: debounce(function () {
        if (this.upgradeCircle.active) {
          this.upgradeCircle.canvas.stop();
        }

        var newPercents = this.getPercentsAnimate();
        var oldPercents = this.upgradeCircle.percentsDisplay;
        this.upgradeCircle.active = true;
        this.upgradeCircle.progressFn = this._createProgressFn(oldPercents, newPercents);
        this.animateCircle(this.upgradeCircle.element, newPercents, this.upgradeCircle.percentsPortion);
      }, 100),
      animateCircle: function animateCircle(element, percents, oldPortion) {
        var portion = percents / 100; // convert from percents

        portion -= Math.min(portion * 0.02, 0.01); // prevent user from confusion by cursor

        element.circleProgress({
          value: portion,
          animationStartValue: oldPortion
        });
        element.circleProgress();
      },
      _createProgressFn: function _createProgressFn(oldPercents, newPercents) {
        var vm = this;
        var percentsDiff = oldPercents - newPercents;
        return function (_event, progress, stepValue) {
          var curDiff = percentsDiff * progress;
          var curPercents = oldPercents - curDiff;
          vm.upgradeCircle.percentsDisplay = curPercents.toFixed(2);
          vm.upgradeCircle.percentsPortion = stepValue;
        };
      },
      defaultCursor: function defaultCursor() {
        this.$refs.circleCursor.style.transform = 'rotate(0deg)';
      },
      animateCursor: function animateCursor(randomVal, isWin, callbackOnComplete) {
        var _self = this;

        var openTime = 12.05 * 1000;

        if (!isWin) {
          var maxVal = 100;
          var minVal = this.getPercentsAnimate(); // Magic to clarify for user whether he won or not

          if (isAsClose(randomVal, maxVal, 1.25)) {
            randomVal -= 1.1;
          }

          if (isAsClose(randomVal, minVal, 1.25)) {
            randomVal += 1.1;
          }
        }

        var portion = randomVal / 100;

        if (this.config.invert) {
          portion = 1 - portion;
        }

        var angle = 360 * getRandomInt(8, 10) + 360 * portion;
        var resetStep = 0;
        this.animateCenter = true;
        this.defaultCursor(); // Setting default state to prevent bugs

        $(this.$refs.circleCursor).animateRotate(angle, {
          duration: openTime,
          easing: 'easeOutCubic',
          step: function step(now) {
            if (_self.soundType === 'tick') {
              var step = Math.floor(Math.abs(now / 44));

              if (step - resetStep >= 1) {
                if (tickSound !== null) {
                  if (canPlaymusic) {
                    tickSound.play();
                    soundCb();
                  }
                } else {
                  tickSound = classicSoundSeq.tickSound();
                  soundCb();
                }

                resetStep++;
              }
            }
          },
          complete: function () {
            callbackOnComplete(isWin);

            if (_self.soundType === 'tick' && isWin) {
              classicSoundSeq.finishSound();
            }

            this.isUpgrading = false;
            setTimeout(function () {
              this.animateCenter = false;
            }.bind(this), 1000);
          }.bind(this)
        });
      },
      showCirclePrize: function showCirclePrize() {
        this.showPrize = true;
      },
      showWin: function showWin() {
        this.winItem.show = true;
      },
      showLose: function showLose() {
        this.showCirclePrize();
      },
      showResultRulette: delay(function (isWin, callback) {
        if (isWin) {
          this.showWin();
        } else {
          this.showLose();
        }

        this.isRandomActive = false;
        this.removeForUpgrade();
        this.removeAllUpgradable();
        setTimeout(function () {
          this.defaultCursor();
        }.bind(this), 500);

        if (!isWin) {
          this.getFilterItemsByConfig();
        } //eslint-disable-next-line no-unused-expressions


        callback && callback();
        this.clearResultRoulette(isWin, callback);
      }, 125),
      clearResultRoulette: delay(function () {
        this.showPrize = false;
      }, 2000),
      getIdsSelectedSkins: function getIdsSelectedSkins() {
        return this.upgradable.selectedSkins.map(function (item) {
          return item.pbaId;
        });
      },
      removeForUpgrade: function removeForUpgrade() {
        if (this.isRandomActive) {
          return;
        }

        this.$root.$emit('removeForUpgrade');
      },
      removeAllUpgradable: function removeAllUpgradable() {
        this.removeParticipatingDrops();
        this.upgradable.selectedSkins.splice(0, this.upgradable.selectedSkins.length);
      },
      removeForUpgradeSelectedSkin: function removeForUpgradeSelectedSkin() {
        this.forUpgradable.selectedSkin = null;
      },
      changeRoll: function changeRoll() {
        if (!this.isUpgrading) {
          this.config.invert = !this.config.invert;
        }
      },
      getForUpgradeProp: function getForUpgradeProp(prop) {
        if (!this.forUpgradable.selectedSkin) return '';
        return this.forUpgradable.selectedSkin[prop];
      },
      getUpgradableItem: function getUpgradableItem(prop) {
        if (!this.upgradable.selectedSkins.length) return '';
        return this.upgradable.selectedSkins[this.upgradable.currentShow][prop];
      },
      changeUpgradableSelection: function changeUpgradableSelection($event) {
        this.upgradable.selectedSkins = $event;
        this.forUpgradable.pagination.current = 1;
        this.getItemsByPriceDrop();
      },
      changeItemsSelection: function changeItemsSelection($event) {
        this.forUpgradable.selectedSkin = $event;
        this.config.factor.value = -1;
      },
      orderPriceUpgradableToggle: function orderPriceUpgradableToggle() {
        this.upgradable.orderPrice = !this.upgradable.orderPrice;
        this.orderUpgradableItems();
      },
      orderUpgradableItems: function orderUpgradableItems() {
        this.upgradable.data = this.sortedArray(this.upgradable.data, 'price', this.upgradable.orderPrice);
      },
      orderPriceItemsToggle: function orderPriceItemsToggle() {
        this.forUpgradable.orderPrice = !this.forUpgradable.orderPrice;
      },
      filtersToggle: function filtersToggle() {
        this.forUpgradable.filtersToggle = !this.forUpgradable.filtersToggle;
      },
      searchToggle: function searchToggle() {
        this.forUpgradable.searchToggle = !this.forUpgradable.searchToggle;

        if (!this.forUpgradable.searchToggle && !this.forUpgradable.data.length) {
          this.forUpgradable.searchName = '';
        }

        setTimeout(function () {
          if (this.forUpgradable.searchToggle) {
            this.$refs.searchInput.focus();
          }
        }.bind(this), 100);
      },
      selectQuality: function selectQuality(quality) {
        this.forUpgradable.quality = quality;
      },
      sortedArray: function sortedArray(arr, key, isDesc) {
        return arr.slice().sort(function (obj1, obj2) {
          return isDesc ? obj2[key] - obj1[key] : obj1[key] - obj2[key];
        });
      },
      openAuthPopup: function openAuthPopup(event) {
        var steamBtn = this.$refs.loginButton;
        var steamUrl = steamBtn.dataset.url;

        if (Cookies.getProtected('policy_confirmed')) {
          steamBtn.href = steamUrl;
          steamBtn.removeAttribute('rel');
          var res = window.loginLinkAuthHandler.call(this.$refs.loginButton, event);

          if (!res) {
            event.preventDefault();
          }
        }
      }
    }
  });
});