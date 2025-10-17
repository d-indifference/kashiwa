import { TableConstructor } from '@admin/lib';
import { ReportDto } from '@persistence/dto/report';
import { LOCALE } from '@locale/locale';
import { Constants } from '@library/constants';
import { simpleFormatDateTime } from '@library/helpers';
import { mapAttachedFileHtml } from '@admin/misc/index';

export const reportTableConstructor = new TableConstructor<ReportDto>()
  .mappedValue(
    LOCALE.POST_NUMBER as string,
    obj =>
      `<a target="_blank" href="/${obj.comment.boardUrl}/${Constants.RES_DIR}/${obj.comment.parentNum}${Constants.HTML_SUFFIX}#${obj.comment.num}">#${obj.comment.num}</a>`
  )
  .mappedValue(LOCALE.POST_PARENT as string, obj =>
    obj.comment.parentNum === obj.comment.num
      ? '-'
      : `<a target="_blank" href="/${obj.comment.boardUrl}/${Constants.RES_DIR}/${obj.comment.parentNum}${Constants.HTML_SUFFIX}#${obj.comment.parentNum}">#${obj.comment.parentNum}</a>`
  )
  .mappedValue(LOCALE.CREATED_AT as string, obj => simpleFormatDateTime(obj.comment.createdAt))
  .mappedValue(LOCALE.IP as string, obj => obj.comment.ip)
  .mappedValue(LOCALE.USER_AGENT as string, obj => obj.comment.userAgent ?? '-')
  .mappedValue(LOCALE.FORM_NAME as string, obj => obj.comment.name)
  .mappedValue(LOCALE.FORM_EMAIL as string, obj => obj.comment.email ?? '-')
  .mappedValue(LOCALE.FORM_SUBJECT as string, obj => obj.comment.subject ?? '-')
  .mappedValue(LOCALE.FORM_COMMENT as string, obj => obj.comment.comment)
  .mappedValue(LOCALE.FORM_FILE as string, obj =>
    obj.comment.attachedFile ? mapAttachedFileHtml(obj.comment.attachedFile) : '-'
  )
  .mappedValue('', obj => obj.reportType)
  .mappedValue(
    '',
    obj =>
      `[<a target="_blank" href="/kashiwa/ban/new?ip=${obj.comment.ip}&boardUrl=${obj.comment.boardUrl}">${LOCALE.BAN_THIS_IP as string}</a>]`
  )
  .mappedValue(
    '',
    obj => `
  <form style="display: inline" method="post" action="/kashiwa/moderation/delete-post/${obj.comment.boardUrl}/${obj.comment.num.toString()}"><input type="submit" value="${LOCALE.DELETE_THIS_POST as string}"></form>
  <form style="display: inline" method="post" action="/kashiwa/moderation/delete-file/${obj.comment.boardUrl}/${obj.comment.num.toString()}"><input type="submit" value="${LOCALE.DELETE_THIS_FILE as string}"></form>
  <form style="display: inline" method="post" action="/kashiwa/moderation/delete-by-ip/${obj.comment.boardUrl}/${obj.comment.ip}"><input type="submit" value="${LOCALE.DELETE_ALL_BY_IP as string}"></form>
  `
  )
  .mappedValue(
    '',
    obj =>
      `<form style="display: inline" method="post" action="/kashiwa/reports/delete/${obj.id}/"><input type="submit" value="${LOCALE.DELETE_THIS_REPORT as string}"></form>`
  );
