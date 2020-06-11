"use strict";

$(function () {
  var btnCopyMail = $('.contact__mail button');
  var inputMail = $('.contact__mail input');
  var copyInfo = $('.copy_info');
  btnCopyMail.click(function () {
    var $temp = $('<input>');
    var spanTextCopy = copyInfo.find('span');
    var copiedElInfoText = spanTextCopy.text();
    $('body').append($temp);
    $temp.val(inputMail.val()).select();
    document.execCommand('copy');
    $temp.remove();
    copyInfo.addClass('copied');
    spanTextCopy.text('Copied');
    setTimeout(function () {
      spanTextCopy.text(copiedElInfoText);
      copyInfo.removeClass('copied');
    }, 3000);
  });
});