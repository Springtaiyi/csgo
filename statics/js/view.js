"use strict";

$(function () {
    var timeToPlay = 30;
    /*
     * Roulette
     * */

    function fillRoulette(cb) {
        var list = rouletteItemsDiv;
        alert(list)
        var tmp = '';

        for (var i = list.children().length; i < ruletteItemsCount; i++) {
            var randomIndex = getRandomInt(0, caseItems.length - 1);
            var randomItem = caseItems[randomIndex];
            tmp += ruletteItem(randomItem);
        }

        list.append(tmp).css('transform', '');

        if (typeof cb === 'function') {
            cb();
        } // loadBigIcons();


        $().Roulette({
            items: $('.rulette_items li')
        });
        $().Roulette('loadBigIcons');
    }

    // dlEvents.caseVeiw();
    var beforeOpenDiv = $('.before-open');
    var rouletteDiv = $('.rulette');
    var rouletteItemsDiv = $('.rulette_items');
    var canOpenWrap = $('.case-can-open');
    var openBtnDiv = $('.case-can-open__btn-wrap');
    var winWrap = $('.case_win_wrap');
    var playAgain = $('.play_again');
    var unableBlock = $('.case-unavailable');
    var replenishAmount = $('.case-text-money');
    var replenishInput = $('.replenish-input-case');
    var replenishForm = $('.replenish-form-case');
    var replenishErrorText = $('.case-need-money__btn-wrap .error-text');
    var freeCaseWrapper = $('.free-case-wrapper');
    var userDropId;
    var ruletteItemsCount = 100;
    var openInProgress = false;
    var hasSellBonus = false;
    var actionPerformed = false;
    var view = window.viewData;
    var caseItems = view.roughItems || [];
    var winImgSuffix = view.winItemImgSuffix;
    var rouletteImgSuffix = view.rouletteImgSuffix;
    var itemColorClasses = view.colorClasses;
    var isFeastCase = !!view.isFeastCase;
    var feastCountInterval = null;
    var openUrl = view.openUrl || '/cases/open';
    var btnContainer = $('.case-can-open__btn-wrap');
    var btnInnerText = $('.case_open_btn');
    var userEventPoints = $('.case-event__points-quantity-block').data('event-points');
    var pointsForOpeningCase = $('.get-points-text').data('points-for-opening');
    var hash = $(location).attr('hash');

    var ruletteItem = _.template($('#rulette_item').html());

    $('#rulette_item').remove();
    var soundType = view.soundsType;
    var Case = {
        id: view.id,
        type: view.catId,
        name: viewData.boxName
    };
    $().Roulette({
        mainCaseWrap: beforeOpenDiv
    });
    replenishInput.on('keydown', function (e) {
        if (!(e.keyCode > 95 && e.keyCode < 106 || e.keyCode > 47 && e.keyCode < 58 || e.keyCode === 8)) {
            return false;
        }
    });
    replenishInput.on('input', function () {
        var inputValue = $(this).val();

        if (inputValue.length >= 8) {
            $(this).val(inputValue.slice(0, 7));
            return false;
        }

        if (inputValue < 1 && inputValue.length >= 1) {
            replenishErrorText.slideDown();
        } else {
            replenishErrorText.slideUp();
        }
    });
    replenishForm.submit(function () {
        if (replenishInput.val() < 1) {
            return false;
        }
    });

    function countMissingMoney() {
        var userBalance = user.balance;
        var casePrice = view.casePrice;
        return Math.ceil(Math.abs((userBalance - casePrice) / 100));
    }

    if (beforeOpenDiv.hasClass('need_money')) {
        replenishAmount.html(countMissingMoney());
    }

    canOpenWrap.on('click', '.case-can-open__btn-wrap.can_open .case-can-open__open-f', function () {
        caseOpen.call(this, true);
    });
    canOpenWrap.on('click', '.case-can-open__btn-wrap.can_open .case-can-open__open-u', function () {
        caseOpen.call(this, false);
    });

    if (hash === '#freeOpen') {
        caseOpen.call($('.case-can-open__btn-wrap.can_open .case-can-open__open-u'), false);
    }

    function caseOpen(isFast) {
        if (openInProgress) {
            return false;
        }

        openInProgress = true;

        var _inner = $(this).find('.for-icon');

        var prevText = _inner.html();

        _inner.html('Buying..');

        var alreadyStarted = false;
        openOnce();

        function openOnce() {
            if (alreadyStarted) {
                return false;
            }

            alreadyStarted = true;
            ajaxQuery({
                url: openUrl,
                data: {
                    caseId: Case.id
                }
            }).done(function (data) {
                if (data.status === 'success') {
                    decreaseFreeCaseCounter();
                    userBalance.set(data.user.wallet);
                    data.weapon.colorSuffix = itemColorClasses[data.weapon.category];
                    $().Roulette({
                        winIcon: data.weapon.image
                    });
                    $().Roulette('preloadWinIcon');
                    $().Roulette('emitEvent');

                    if (!isFast) {
                        showRoulette(data);

                        if (soundType === 'music') {
                            $(document).trigger('sc-play-music', {
                                type: Case.type,
                                caseName: Case.name,
                                caseId: Case.id
                            });
                        } else {
                            classicSoundSeq.startSound();
                        }
                    } else {
                        data.weapon.size = rouletteImgSuffix;
                        replaceWinRouletteItem(data);
                        setPrizeData(data);
                        beforeOpenDiv.stop().fadeOut(400);
                        showPrize(data);
                    }
                } else {
                    showAjaxAnswer(data);
                    openCaseEnd();
                }
            }).fail(function () {
                openCaseEnd();
            });
        }

        function decreaseFreeCaseCounter() {
            var freeCaseCounterValue = freeCaseWrapper.find('.free_counter');
            var freeCaseCounterValueInt = parseInt(freeCaseCounterValue.text());

            if (freeCaseCounterValueInt > 1) {
                freeCaseCounterValue.text(parseInt(freeCaseCounterValue.text()) - 1);
            } else {
                freeCaseWrapper.hide();
                freeCaseWrapper.data('count', 0);
            }
        }

        function replaceWinRouletteItem(data) {
            rouletteItemsDiv.find('li:eq(' + (ruletteItemsCount - 4) + ')').replaceWith(ruletteItem(data.weapon));
        }

        function showRoulette(data) {
            fillRoulette();
            var openTime = 12;
            var swipedItems = ruletteItemsCount - 7;
            var itemWidth = rouletteItemsDiv.children().width();
            var randomOffset = getRandomArbitrary(-50, itemWidth * 0.625);
            data.weapon.size = rouletteImgSuffix;
            replaceWinRouletteItem(data);
            setPrizeData(data);
            var resetStep = -1;
            var tickSound = null;
            var canPlaymusic = true;

            function soundCb() {
                canPlaymusic = false;
                setTimeout(function () {
                    canPlaymusic = true;
                }, timeToPlay);
            }

            TweenLite.to($('.rulette_items'), openTime, {
                x: -(itemWidth * swipedItems + randomOffset),
                ease: Circ.easeOut,
                startAt: {
                    x: 0
                },
                onStart: function onStart() {
                    beforeOpenDiv.stop().fadeOut(500);
                    rouletteDiv.stop().delay(600).fadeIn(500);
                },
                overwrite: true,
                onUpdateParams: [Math.abs(randomOffset) / itemWidth],
                onUpdate: function onUpdate(randomCount) {
                    if (soundType === 'tick') {
                        if (this.ratio !== 1 && resetStep !== 0) {
                            var now = Math.ceil(swipedItems * this.ratio - randomCount + 0.4);

                            if (resetStep < now) {
                                if (tickSound !== null) {
                                    if (canPlaymusic) {
                                        tickSound.play();
                                        soundCb();
                                    }
                                } else {
                                    tickSound = classicSoundSeq.tickSound();
                                    soundCb();
                                }

                                resetStep = now;
                            }
                        }
                    }
                },
                onComplete: function onComplete() {
                    showPrize(data);

                    if (soundType === 'tick') {
                        classicSoundSeq.finishSound();
                    }

                    TweenLite.delayedCall(0.5, function () {
                        rouletteItemsDiv.find('li:lt(' + swipedItems + ')').remove();
                    });
                }
            });
        }

        function setPrizeData(data) {
            var winBlock = winWrap;
            var weapon = {
                type: winBlock.find('.winner-info .case-name'),
                img: winBlock.find('.subject-img img'),
                name: winBlock.find('.subject-name .name'),
                title: winBlock.find('.subject-name .title'),
                price: winBlock.find('.btn-action .sell_price'),
                upgrade: winBlock.find('.btn-action .make_upgrade'),
                itemAnchor: winBlock.find('.win-text .item-anchor')
            };

            if (hash === '#freeOpen') {
                location.hash = '';
            }

            winBlock.removeClass('win_block_c1 win_block_c2 win_block_c3 win_block_c4 win_block_c5 win_block_c6 win_block_c7');
            winBlock.addClass('win_block_c' + data.weapon.colorSuffix);
            weapon.type.html(data.weaType);
            weapon.img.attr('src', data.weapon.weaType + winImgSuffix);
            weapon.name.html(stattrakPrefix(data.weapon.stattrak, ' ') + data.weapon.weaName);
            weapon.title.html(data.weapon.weaType);
            weapon.price.html(data.weapon.weaPrice);
            weapon.itemAnchor.attr('href', '/profile/' + data.user.id + '?drop_id=' + data.drop.id);

            if (data.drop.bonusSum && parseFloat(data.drop.bonusSum) > 0) {
                hasSellBonus = true;
                var bonus = {
                    block: winBlock.find('.sell_bonus'),
                    price: winBlock.find('.js_bonus_amount'),
                    timer: winBlock.find('.js_bonus_timer'),
                    sellBtn: winBlock.find('.btn-action .sell_item')
                };
                bonus.price.html(data.drop.bonusSum);
                var remainTime = data.drop.bonusLifeTime - 1.5; // we suppose that request took about 1.5 second and so subtract it

                startBonusTimer(bonus.timer, remainTime, bonus.sellBtn);
                bonus.block.show();
            }

            if (weapon.upgrade.length) {
                weapon.upgrade.attr('href', weapon.upgrade.attr('href_tpl').replace('XXX', data.drop.id));
            }
        }

        function showPrize(data) {
            userDropId = data.drop.id;
            actionPerformed = false;

            if (socket.connected) {
                socket.emit('new_drop', {
                    id: data.drop.id,
                    user_id: data.user.id
                });
            } else {
                data.price = data.drop.price;
                addLiveDrop(data);
            }

            setTimeout(function () {
                rouletteDiv.fadeOut(400);
                $('.before-open .case-price span').html(data.source.curPrice);

                if (data.source.curPrice !== 0) {
                    $('.free-icon').addClass('hidden');
                }

                winWrap.fadeIn(400, function () {
                    openCaseEnd();
                });
            }, 500);
        }

        function openCaseEnd() {
            _inner.html(prevText);

            openInProgress = false;
            var oldUserEventPoints = userEventPoints;
            userEventPoints = userEventPoints + pointsForOpeningCase;

            if (isFeastCase) {
                feastCountInterval = animateNumbers(oldUserEventPoints, userEventPoints, $('.case-event__points-quantity'));
            }
        }
    }

    function startBonusTimer(el, lifeTime, btn) {
        var maxOpacityDecrement = 0.6; // 1 - minOpacity

        var parentEl = el.closest('.sell_bonus');
        btn.addClass('has-bonus-btn');

        function setDropETA(el) {
            var remainingSeconds = el.data('remain');
            var elapseTime = new Date();
            elapseTime.setTime(Date.now() + remainingSeconds * 1000);
            el.data('ETA', elapseTime);
            return elapseTime;
        }

        function secondsToTimer(seconds) {
            var m = addZero(Math.floor(seconds / 60 % 60));
            var s = addZero(seconds % 60);
            return m + ':' + s;
        }

        function cdUpdateTime(el) {
            var ETA = el.data('ETA');
            var diffTime = Math.round((ETA - Date.now()) / 1000);

            if (diffTime < 0) {
                hasSellBonus = false;
                clearInterval(timeCounter);
                btn.removeClass('has-bonus-btn');
                parentEl.animate({
                    width: 0
                }, 400, function () {
                    parentEl.hide().css({
                        width: '',
                        opacity: ''
                    });
                });
                return;
            }

            if (!hasSellBonus) {
                clearInterval(timeCounter);
            }

            el.html(secondsToTimer(diffTime));
            var percentPassed = (lifeTime - diffTime) / lifeTime;
            parentEl.css('opacity', 1 - percentPassed * maxOpacityDecrement);
        }

        el.data('remain', lifeTime);
        setDropETA(el);
        cdUpdateTime(el);
        var timeCounter = setInterval(function () {
            cdUpdateTime(el);
        }, 1000);
    }

    $('.sell_item').on('click', function () {
        if (actionPerformed) {
            return;
        }

        actionPerformed = true;
        ajaxQuery({
            url: '/users-drop/sell',
            data: {
                dropId: userDropId,
                useBonus: hasSellBonus
            }
        }).done(function (data) {
            if (data.status === 'success') {
                userBalance.set(data.wallet);
                showAlert('success', 'You got ' + data.cost.formatCents());
                playAgain.click();
            } else {
                showAjaxAnswer(data);
            }
        }).fail(function () {
            actionPerformed = false;
        });
    });
    /*Btn is hidden now*/

    /*$('.take_item').on('click', function() {
        if(actionPerformed) {
            return;
        }
        actionPerformed = true;
         ajaxQuery({
            url: '/users-drop/get',
            data: {
                dropId: userDropId,
            },
        })
        .done(function(data) {
            if(data.status === 'success') {
                showAlert('success', 'Item was added to withdrawal queue');
                 playAgain.click();
            } else {
                showAjaxAnswer(data);
            }
        })
        .fail(function() {
            actionPerformed = false;
        });
    });*/

    playAgain.on('click', function () {
        winWrap.fadeOut(400, function () {
            var userBalance = user.balance;
            var casePrice = view.casePrice;
            var caseButtonBlock = $('.case-button-block');
            var freeOpenCount = freeCaseWrapper.data('count');
            beforeOpenDiv.show();
            hasSellBonus = false;

            if (userBalance < casePrice && !freeOpenCount) {
                replenishAmount.html(countMissingMoney());
                beforeOpenDiv.removeClass('can_open').addClass('need_money');
                caseButtonBlock.removeClass('can_open').addClass('need_money');
            }

            winWrap.find('.sell_bonus').hide();
            winWrap.find('.sell_item').removeClass('has-bonus-btn');

            if (feastCountInterval !== null && isFeastCase) {
                clearInterval(feastCountInterval);
                $('.case-event__points-quantity').html(userEventPoints);
            }
        });
    });

    function updateStateCases(data) {
        $.each(data, function (_i, value) {
            if (Case.id === value.id) {
                if (value.isActive) {
                    beforeOpenDiv.removeClass('unavailable');
                    btnContainer.removeClass('unavailable');
                    beforeOpenDiv.addClass('can_open');
                    btnContainer.addClass('can_open');
                    openBtnDiv.css({
                        opacity: 1
                    });
                    unableBlock.css('display', 'none');
                    $.each(btnInnerText, function () {
                        $(this).text('Open');
                    });
                } else {
                    beforeOpenDiv.addClass('unavailable');
                    btnContainer.addClass('unavailable');
                    beforeOpenDiv.removeClass('can_open');
                    btnContainer.removeClass('can_open');
                    openBtnDiv.css({
                        opacity: 0
                    });
                    unableBlock.css('display', 'block');
                    $.each(btnInnerText, function () {
                        $(this).text('Unavailable');
                    });
                }
            }
        });
    } //edit left position for provably fair popup in case if this element off the screen


    var documentWidth = $(document).width();
    var provablyFairPopUpElem = $('.provably-fair-stats');

    function editLeftPosition() {
        provablyFairPopUpElem.each(function () {
            var self = $(this);
            var leftPosition = self.offset().left;
            var provablyFairPopUpWidth = self.width();
            var difference = documentWidth - leftPosition;

            if (provablyFairPopUpWidth > difference) {
                var newLeftPosition = provablyFairPopUpWidth - difference;
                $(self).css('left', '-' + (newLeftPosition + 15) + 'px');
            }
        });
    }

    editLeftPosition();
    window.updateStateCases = updateStateCases;
    socket.on('case_update', function (data) {
        if (Case.id === data.caseId) {
            updateCaseQuantity(data.currentQuantity, $('.case-wrap .quantity-current'));
        }
    });

    if (hash && hash === '#to_roulette') {
        $('html, body').animate({
            scrollTop: $('.count-social-wrapper') ? $('.count-social-wrapper').offset().top : 0
        }, 1000);
    }
});