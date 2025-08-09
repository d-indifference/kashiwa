const handleVideoPlaying = (video, locale, postNum) => {
  const buttonName = `btn-${postNum}`;

  if (document.getElementsByName(buttonName).length === 0) {
    const closeButton = document.createElement('button');
    closeButton.name = buttonName;
    closeButton.innerText = locale;
    closeButton.type = 'button';
    closeButton.addEventListener('click', () => { closeVideo(video, closeButton) });

    video.parentNode.insertBefore(closeButton, video);
  }
};

const closeVideo = (video, closeButton) => {
  video.pause();
  video.currentTime = 0;
  video.load();
  closeButton.remove();
};
