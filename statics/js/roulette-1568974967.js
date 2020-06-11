(function ($) {

    var cachedRouletteIcons = {};

    var view = window.viewData;
    var caseItems = view.roughItems || [];
    var caseItemsByPattern = {};
    var caseName = view.caseName || '';

    var rouletteImgSuffix = view.rouletteImgSuffix;
    var winImgSuffix = view.winItemImgSuffix;

    for (var key in caseItems) {
        var item = caseItems[key];

        item.colorSuffix = item.color;
        caseItemsByPattern[item.patternId] = item;
    }

    var options = {};

    var methods = {
        init: function (option) {
            options['items'] = option.items;
            options['winIcon'] = option.winIcon;
            options['mainCaseWrap'] = option.mainCaseWrap;
        },

        loadBigIcons: function () {
            var plates = options.items;
            var foundPatterns = {};
            var loadingSequence = [];

            for (var i = plates.length - 1; i >= 0; i--) {
                var element = $(plates[i]);
                var patternId = element.data('index');

                if (foundPatterns[patternId] || cachedRouletteIcons[patternId]) {
                    continue;
                }

                var caseItem = caseItemsByPattern[patternId];

                if (caseItem) {
                    foundPatterns[patternId] = true;

                    var clearUrl = caseItem.image;

                    loadingSequence.push([patternId, clearUrl]);
                }
            }

            loadingSequence.forEach(function (batch) {
                var patternId = batch[0];
                var bigIcon = batch[1] + rouletteImgSuffix;

                var downloadingBigIcon = new Image();
                downloadingBigIcon.src = bigIcon;

                $(downloadingBigIcon).on('load', function () {
                    var src = this.src;

                    plates.filter('[data-index=\'' + batch[0] + '\']').find('img').attr('src', src);

                    var caseItem = caseItemsByPattern[patternId];
                    caseItem.size = rouletteImgSuffix;

                    cachedRouletteIcons[patternId] = true;
                });
            });
        },

        preloadWinIcon: function () {
            var downloadingBigIcon = new Image();
            downloadingBigIcon.src = options.winIcon + winImgSuffix;

            return downloadingBigIcon;
        },

        emitEvent: function () {
            dlEvents && dlEvents.caseOpened(caseName);

            if (options.mainCaseWrap) {
                options.mainCaseWrap.trigger('case-opened');
            }
        },
    };

    $.fn.Roulette = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            var opts = Object.assign({}, options, arguments[0]);

            return methods.init.apply(this, [opts]);
        } else {
            $.error('Метод с именем ' + method + ' не существует для Roulette');
        }
    };

})(jQuery);
