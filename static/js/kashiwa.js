function setCookie(name, value, days) {
  var expires = '';

  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }

  document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];

    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }

    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
}

function eraseCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999;';
}

function insert(formId, text) {
  var form = document.getElementById(formId);

  if (form) {
    if (form.comment) {
      form.comment.value += text + '\n';
    }
  }
}

function setNameFromCookies(cookieName, formId) {
  var name = getCookie(cookieName);
  var form = document.getElementById(formId);

  if (form) {
    if (form.name) {
      if (name !== null) {
        form.name.value = decodeURIComponent(name);
      } else {
        form.name.value = '';
      }
    }
  }
}

function setEmailFromCookies(cookieName, formId) {
  var email = getCookie(cookieName);
  var form = document.getElementById(formId);

  if (form) {
    if (form.email) {
      if (email !== null) {
        form.email.value = decodeURIComponent(email);
      } else {
        form.email.value = '';
      }
    }
  }
}

function highlightPost(postNum) {
  $('.highlight').removeClass('highlight').addClass('reply');

  var post = document.getElementById('reply' + postNum);

  if (post) {
    $('#reply' + postNum).addClass('highlight').removeClass('reply');
  }
}

function setDelPass(cookieName) {
  var post_form = document.getElementById('postform');
  post_form.password.value = getCookie(cookieName);

  var del_form = document.getElementById('delform');
  del_form.password.value = getCookie(cookieName);
}

function getFrameByName(name) {
  var frames = window.parent.frames;
  for (var i = 0; i < frames.length; i++) {
    if (name === frames[i].name) {
      return(frames[i]);
    }
  }
}

function setStyle(cookieName) {
  if (!getCookie(cookieName)) {
    setCookie(cookieName, 'Futaba', 365);
  }

  var currentStyle = getCookie(cookieName);

  $('link[rel][title]').each(function () {
    this.disabled = this.title !== currentStyle;
  });
}

function setStyleAtMain(cookieName) {
  setStyle(cookieName);
}

function setStyleAtFrame(menuFrame, cookieName) {
  var frame = getFrameByName(menuFrame);
  frame.setStyle(cookieName);
}

function changeStyle(styleTitle, cookieName) {
  setCookie(cookieName, styleTitle, 365);
  setStyleAtMain(cookieName);
  setStyleAtFrame('menu', cookieName);
}

function processReplyPreview(boardUrl) {
  $("a.ref").hover(
    function(e) {
      var postAddress = $(e.target).attr("class").split(' ')[1].split('|');
      showReplyPreview(e.pageX, e.pageY, boardUrl, postAddress);
    },
    function(e) {
      $(".reply-link-container").html('').hide();
    }
  );
}

function showReplyPreview(pageX, pageY, boardUrl, postAddress) {
  var replyLinkContainer = $(".reply-link-container");

  replyLinkContainer.css({
    'top': pageY + 'px',
    'left': pageX + 'px'
    })
    .show();

  var threadNumber = postAddress[0];
  var postNumber = postAddress[1];

  $.ajax({
    url: "/api/v1/" + boardUrl + '/' + postNumber,
    type: "GET",
    success: function(result) {
      replyLinkContainer.html(buildReferenceHtml(boardUrl, threadNumber, postNumber, result));
    },
    error: function(xhr) {
      var response = JSON.parse(xhr.responseText);
      replyLinkContainer.html('<p>' + response.statusCode + ': ' + response.message + '</p>');
    }
  });
}

function buildReferenceHtml(boardUrl, threadNumber, postNumber, content) {
  var result = '<table><tbody><tr><td class="reply"><label><span class="replytitle">';

  if (content.subject == null) {
    result += '';
  } else {
    result += content.subject;
  }

  result += '</span><span class="commentpostername">' + content.name + '</span>&nbsp;'
    + new Date(content.createdAt).toLocaleString() + '&nbsp;</label><span class="reflink">No. ' + content.num + '</span><br>';

  if (content.attachedFile) {
    var attachedFile = content.attachedFile;
    result += '<span class="filesize">File: <a href="#">' + attachedFile.path + '</a>';

    if (attachedFile.width && attachedFile.height) {
      result += '(<em>' + attachedFile.width + 'x' + attachedFile.height + '</em>)';
    }

    result += '</span>';

    if (attachedFile.isImage) {
      result += '<a target="_blank" href="' + attachedFile.path + '"><img class="thumb" src="'+ attachedFile.thumbnailPath + '" alt="'+ attachedFile.size +'" width="'+ attachedFile.thumbnailWidth +'" height="'+ attachedFile.thumbnailHeight +'"></a>';
    } else if (attachedFile.isVideo) {
      result += '<a target="_blank" href="' + attachedFile.path + '"><img class="thumb" src="'+ attachedFile.thumbnailPath + '" alt="'+ attachedFile.size +'" width="'+ attachedFile.thumbnailWidth +'" height="'+ attachedFile.thumbnailHeight +'"></a>';
    } else {
      result += '<a target="_blank" href="' + attachedFile.path + '"><img class="thumb" src="/img/file.png" alt="'+ attachedFile.size +'" width="86" height="86"></a>';
    }
  }

  result += '<blockquote>' + content.comment + '</blockquote>';

  result += '</td></tr></tbody></table>';

  return result;
}

function createHiddenThreadsObject() {
  var clearingIntervalYears = 5;
  var currentDate = new Date();
  var nextCleaningDate = (new Date).setFullYear(currentDate.getFullYear() + clearingIntervalYears);

  var storageObject = {
    nextCleaning: nextCleaningDate
  };

  localStorage.setItem('hiddenThreads', JSON.stringify(storageObject));
}

function initHiddenThreads() {
  if (!localStorage.getItem('hiddenThreads')) {
    createHiddenThreadsObject();
  }
}

function clearHiddenThreads() {
  if (localStorage.getItem('hiddenThreads')) {
    var now = Date.now();
    var currentHiddenThreads = JSON.parse(localStorage.getItem('hiddenThreads'));

    if (now > currentHiddenThreads.nextCleaning) {
      createHiddenThreadsObject();
    }
  }
}

function hideThread(board, num) {
  clearHiddenThreads();
  initHiddenThreads();

  var currentHiddenThreads = JSON.parse(localStorage.getItem('hiddenThreads'));

  if (!currentHiddenThreads[board]) {
    currentHiddenThreads[board] = [];
  }

  if (currentHiddenThreads[board].indexOf(num) === -1) {
    currentHiddenThreads[board].push(num);
  }

  localStorage.setItem('hiddenThreads', JSON.stringify(currentHiddenThreads));
  applyThreadHiding();
}

function applyThreadHiding() {
  var boardUrl = document.location.pathname.split('/')[1];
  var hiddenThreadsStorage = JSON.parse(localStorage.getItem('hiddenThreads'));

  if (hiddenThreadsStorage.hasOwnProperty(boardUrl)) {
    var hiddenThreadNums = hiddenThreadsStorage[boardUrl];

    for (var i = 0; i < hiddenThreadNums.length; i++) {
      var hiddenThreadId = '#thread-' + hiddenThreadNums[i];

      var hiddenThread = $(hiddenThreadId);

      if (!hiddenThread.hasClass('hidden')) {
        hiddenThread.addClass('hidden');

        var linkToHiddenThread = hiddenThread
          .children('span.replytothread')
          .children('a')
          .attr('href');

        hiddenThread.before('<div id="hidden-' + hiddenThreadNums[i] + '">Thread <a href="' + linkToHiddenThread + '">' + hiddenThreadNums[i] + '</a> is hidden. <button type="button" onclick="showThread(\''+ boardUrl +'\', \''+ hiddenThreadNums[i] +'\')">Show</button></div>');
      }
    }
  }
}

function showThread(url, num) {
  var hiddenThreadsStorage = JSON.parse(localStorage.getItem('hiddenThreads'));

  if (hiddenThreadsStorage.hasOwnProperty(url)) {
    var hiddenThreadIndex = hiddenThreadsStorage[url].indexOf(num);

    if (hiddenThreadIndex !== -1) {
      hiddenThreadsStorage[url].splice(hiddenThreadIndex, 1);

      var hiddenThreadId = '#thread-' + num;
      var hiddenReplacerId = '#hidden-' + num;

      $(hiddenReplacerId).remove();
      $(hiddenThreadId).removeClass('hidden');

      localStorage.setItem('hiddenThreads', JSON.stringify(hiddenThreadsStorage));
    }
  }
}
