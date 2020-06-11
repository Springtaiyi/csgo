"use strict";

$(function () {
  function scrollTo(el) {
    $(window).on('load', function () {
      setTimeout(function () {
        var rawEl = el[0];
        rawEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 1);
    });
  }

  function findQuestion(name) {
    if (!name) {
      return;
    }

    var el = $('.faq[data-name=' + name + ']');

    if (!el.length) {
      el = $('.faq[data-id=' + name + ']');
    }

    return el;
  }

  function highlight(item) {
    item.addClass('highlighted');
    setTimeout(function () {
      item.removeClass('highlighted');
    }, 500);
  }

  var questionName = window.location.hash.substr(1);
  var questionEl = findQuestion(questionName);

  if (questionEl && questionEl.length) {
    scrollTo(questionEl);
    highlight(questionEl);
  }
});