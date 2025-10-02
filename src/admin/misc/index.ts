import { TableConstructor } from '@admin/lib';
import { BoardShortDto } from '@persistence/dto/board';
import { LOCALE } from '@locale/locale';
import { Constants } from '@library/constants';
import { AttachedFileModerationDto, CommentModerationDto } from '@persistence/dto/comment/moderation';
import { BanCreateForm } from '@admin/forms/ban';
import { TimeUnits } from '@persistence/dto/ban';

const mapAttachedFileHtml = (file: AttachedFileModerationDto): string => {
  if (file.isImage) {
    if (file.name === 'NO_THUMB') {
      return `<div class="nothumb">${LOCALE.POST_NO_FILE as string}</div>`;
    }
    return `
      <a href="/${file.boardUrl}/${Constants.SRC_DIR}/${file.name}" target="_blank">
      <img alt="${file.mime}" class="thumb" width="${file.thumbnailWidth}" height="${file.thumbnailHeight}" src="/${file.boardUrl}/${Constants.THUMB_DIR}/${file.thumbnail}">
      </a>
      `;
  } else if (file.isVideo) {
    if (file.name === 'NO_THUMB') {
      return `<div class="nothumb">${LOCALE.POST_NO_FILE as string}</div>`;
    }
    return `
      <video 
        class="video-thumb" 
        preload="none" 
        controls 
        loop 
        muted 
        poster="/${file.boardUrl}/${Constants.THUMB_DIR}/${file.thumbnail}"
        src="/${file.boardUrl}/${Constants.SRC_DIR}/${file.name}"
        onplay="handleVideoPlaying(this, '${LOCALE.CLOSE_VIDEO as string}', '${file.id}')"
       >
      <a href="/${file.boardUrl}/${Constants.SRC_DIR}/${file.name}">${LOCALE.DOWNLOAD_VIDEO_HERE as string}</a>
      </video>
      `;
  }
  return `
      <a href="/${file.boardUrl}/${Constants.SRC_DIR}/${file.name}" target="_blank">${file.name}</a>
      `;
};

const mapThreadOptions = (comment: CommentModerationDto): string => {
  if (comment.num !== comment.parentNum) {
    return '-';
  }

  let result = '';

  if (comment.pinnedAt) {
    result += `<form action="/kashiwa/moderation/toggle-post-pinning/${comment.boardUrl}/${comment.num}" method="post"><input type="submit" value="${LOCALE.UNPIN as string}"></form>`;
  } else {
    result += `<form action="/kashiwa/moderation/toggle-post-pinning/${comment.boardUrl}/${comment.num}" method="post"><input type="submit" value="${LOCALE.PIN as string}"></form>`;
  }

  if (comment.isPostingEnabled) {
    result += `<form action="/kashiwa/moderation/toggle-thread-posting/${comment.boardUrl}/${comment.num}" method="post"><input type="submit" value="${LOCALE.DISABLE_REPLIES as string}"></form>`;
  } else {
    result += `<form action="/kashiwa/moderation/toggle-thread-posting/${comment.boardUrl}/${comment.num}" method="post"><input type="submit" value="${LOCALE.ENABLE_REPLIES as string}"></form>`;
  }

  return result;
};

/** Table constructor for moderation boards list */
export const moderationBoardTableConstructor = new TableConstructor<BoardShortDto>()
  .mappedValue(
    LOCALE.URL as string,
    obj => `/<a href="/${obj.url}/kashiwa${Constants.HTML_SUFFIX}" target="_blank">${obj.url}</a>/`
  )
  .plainValue(LOCALE.NAME as string, 'name')
  .plainValue(LOCALE.LAST_POST_INDEX as string, 'postCount')
  .mappedValue('', obj => `[<a href="/kashiwa/moderation/${obj.id}">${LOCALE.GO_TO_MODERATION as string}</a>]`);

/** Table constructor for moderation comments list */
export const moderationCommentsTableConstructor = new TableConstructor<CommentModerationDto>()
  .mappedValue(
    LOCALE.POST_NUMBER as string,
    obj =>
      `<a target="_blank" href="/${obj.boardUrl}/${Constants.RES_DIR}/${obj.parentNum}${Constants.HTML_SUFFIX}#${obj.num}">#${obj.num}</a>`
  )
  .mappedValue(LOCALE.POST_PARENT as string, obj =>
    obj.parentNum === obj.num
      ? '-'
      : `<a target="_blank" href="/${obj.boardUrl}/${Constants.RES_DIR}/${obj.parentNum}${Constants.HTML_SUFFIX}#${obj.parentNum}">#${obj.parentNum}</a>`
  )
  .dateTimeValue(LOCALE.CREATED_AT as string, 'createdAt')
  .plainValue(LOCALE.IP as string, 'ip')
  .plainValue(LOCALE.FORM_NAME as string, 'name')
  .nullablePlainValue(LOCALE.FORM_EMAIL as string, 'email')
  .nullablePlainValue(LOCALE.FORM_SUBJECT as string, 'subject')
  .plainValue(LOCALE.FORM_COMMENT as string, 'comment')
  .mappedValue(LOCALE.FORM_FILE as string, obj => (obj.attachedFile ? mapAttachedFileHtml(obj.attachedFile) : '-'))
  .mappedValue('', obj => mapThreadOptions(obj))
  .mappedValue(
    '',
    obj =>
      `[<a target="_blank" href="/kashiwa/ban/new?ip=${obj.ip}&boardUrl=${obj.boardUrl}">${LOCALE.BAN_THIS_IP as string}</a>]`
  )
  .mappedValue(
    '',
    obj => `
  <form style="display: inline" method="post" action="/kashiwa/moderation/delete-post/${obj.boardUrl}/${obj.num.toString()}"><input type="submit" value="${LOCALE.DELETE_THIS_POST as string}"></form>
  <form style="display: inline" method="post" action="/kashiwa/moderation/delete-file/${obj.boardUrl}/${obj.num.toString()}"><input type="submit" value="${LOCALE.DELETE_THIS_FILE as string}"></form>
  <form style="display: inline" method="post" action="/kashiwa/moderation/delete-by-ip/${obj.boardUrl}/${obj.ip}"><input type="submit" value="${LOCALE.DELETE_ALL_BY_IP as string}"></form>
  `
  );

/** Default presets of ban creation form */
export const getDefaultBanForm = (ip?: string, boardUrl?: string): BanCreateForm => {
  const formContent = new BanCreateForm();
  formContent.timeValue = 3;
  formContent.timeUnit = TimeUnits.HOURS;
  formContent.reason = LOCALE.BAN_REASON_DEFAULT as string;
  formContent.boardUrl = boardUrl ?? '';

  if (ip) {
    formContent.ip = ip ?? '';
  }

  return formContent;
};
