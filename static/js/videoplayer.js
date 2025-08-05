const handleVideoPlaying = (video, locale) => {
  const closeButton = document.createElement('button');
  closeButton.innerText = locale;
  closeButton.type = 'button';
  closeButton.addEventListener('click', () => { closeVideo(video, closeButton) });

  video.parentNode.insertBefore(closeButton, video);
};

const closeVideo = (video, closeButton) => {
  video.pause();
  video.currentTime = 0;
  video.load();
  closeButton.remove();
};
