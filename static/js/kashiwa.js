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
