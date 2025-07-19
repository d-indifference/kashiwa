import { Page } from '@persistence/lib/page';
import { LOCALE } from '@locale/locale';
import { fileSize, simpleFormatDateTime } from '@library/helpers';

/**
 * Mapper of table value for its string converting
 */
type TableValueMapper<T> = (obj: T) => string;

/**
 * Builder for HTML table
 */
export class TableConstructor<T> {
  /**
   * Table headers
   */
  private readonly headers: string[] = [];

  /**
   * List of mappers for every table value
   */
  private readonly mappers: TableValueMapper<T>[] = [];

  /**
   * Save custom mapper for table value
   * @param header Table header for this mapped column
   * @param mapper Column value mapper
   */
  public mappedValue(header: string, mapper: TableValueMapper<T>): TableConstructor<T> {
    this.headers.push(header);
    this.mappers.push(mapper);
    return this;
  }

  /**
   * Simple conversion of field value to string
   * @param header Table header for this mapped column
   * @param field Field name
   */
  public plainValue<K extends keyof T>(header: string, field: K): TableConstructor<T> {
    return this.mappedValue(header, obj => String(obj[field]));
  }

  /**
   * Conversion of field value to date-time format
   * @param header Table header for this mapped column
   * @param field Field name
   */
  public dateTimeValue<K extends keyof T>(header: string, field: K): TableConstructor<T> {
    return this.mappedValue(header, obj => simpleFormatDateTime(obj[field] as Date));
  }

  /**
   * Conversion of field value to file size format
   * @param header Table header for this mapped column
   * @param field Field name
   */
  public fileSizeValue<K extends keyof T>(header: string, field: K): TableConstructor<T> {
    return this.mappedValue(header, obj => fileSize(obj[field] as number));
  }

  /**
   * Making an HTML table string from Prisma page of entities
   * @param page Prisma result page object
   * @param linkToEntities Link to handler for creation a new entity of this type
   */
  public fromPage(page: Page<T>, linkToEntities: string): string {
    let tableHtml = `<table align="center" style="'white-space: nowrap">
    <thead>
    <tr class="row1">
    ${this.headers
      .map(header => `<th>${header}</th>`)
      .join('')
      .trim()}
    </tr>
    </thead>
    <tbody>
    `;

    page.content.forEach((rec, idx) => {
      tableHtml += `<tr class="${(idx + 1) % 2 === 0 ? 'row1' : 'row2'}">`;

      this.mappers.forEach(mapper => {
        tableHtml += `<td>${mapper(rec)}</td>`;
      });

      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    tableHtml += this.createPaginator(page, linkToEntities);
    tableHtml += `<div align="center">[<a href="${linkToEntities}/new">${LOCALE['ADD_NEW'] as string}</a>]</div>`;

    return tableHtml;
  }

  /**
   * Creates a paginator string for table
   */
  private createPaginator(page: Page<T>, linkToEntities: string): string {
    let paginatorHtml = '<div align="center">';

    if (page.previous !== null) {
      paginatorHtml += `<a href="${linkToEntities}?page=${page.previous}">←</a>`;
    }

    paginatorHtml += '&nbsp;<';

    for (let i = 0; i < page.total; i++) {
      if (i === page.current) {
        paginatorHtml += `[${i}]`;
      } else {
        paginatorHtml += `[<a href="${linkToEntities}?page=${i}">${i}</a>]`;
      }
    }

    paginatorHtml += '>&nbsp;';

    if (page.next !== null) {
      paginatorHtml += `<a href="${linkToEntities}?page=${page.next}">→</a>`;
    }

    return `${paginatorHtml}</div><br>`;
  }
}
