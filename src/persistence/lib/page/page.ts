import { PrismaService } from '@persistence/lib';
import { PageRequest } from '@persistence/lib/page/page-request';
import { NotFoundException } from '@nestjs/common';

type PrismaFindInput = {
  take: number;

  skip: number;

  where?: unknown;

  orderBy?: unknown;

  include?: unknown;
};

/**
 * Generic pagination wrapper for Prisma models.
 */
export class Page<T> {
  /**
   * The paginated content for the current page.
   */
  content: T[];

  /**
   * The previous page number, or `null` if there is no previous page.
   */
  previous: number | null = null;

  /**
   * The next page number, or `null` if there is no next page.
   */
  next: number | null = null;

  /**
   * The current page number.
   */
  current: number = 0;

  /**
   * The total number of pages.
   */
  total: number;

  /**
   * Static factory method that creates a `Page<T>` instance from a Prisma model query
   * @param prisma The Prisma service instance used to access the database
   * @param model The name of the Prisma model (as a key of `prisma`)
   * @param pageRequest The pagination request object containing limit and page number.
   */
  public static async of<T>(prisma: PrismaService, model: string, pageRequest: PageRequest): Promise<Page<T>> {
    return await Page.templateOf(prisma, model, pageRequest);
  }

  /**
   * Static factory method that creates a `Page<T>` instance from a Prisma model query with conditions, ordering and including
   * @param prisma The Prisma service instance used to access the database
   * @param model The name of the Prisma model (as a key of `prisma`)
   * @param pageRequest The pagination request object containing limit and page number.
   * @param whereInput Prisma `where` input
   * @param orderBy Prisma `orderBy` input
   * @param include Prisma `include` input
   */
  public static async ofFilter<T, W, O, I>(
    prisma: PrismaService,
    model: string,
    pageRequest: PageRequest,
    whereInput: W,
    orderBy: O,
    include: I
  ): Promise<Page<T>> {
    return await Page.templateOf(prisma, model, pageRequest, whereInput, orderBy, include);
  }

  /**
   * Template method for Prisma pagination
   * @param prisma The Prisma service instance used to access the database
   * @param model The name of the Prisma model (as a key of `prisma`)
   * @param pageRequest The pagination request object containing limit and page number.
   * @param whereInput Prisma `where` input
   * @param orderBy Prisma `orderBy` input
   * @param include Prisma `include` input
   */
  private static async templateOf<T, W, O, I>(
    prisma: PrismaService,
    model: string,
    pageRequest: PageRequest,
    whereInput?: W,
    orderBy?: O,
    include?: I
  ): Promise<Page<T>> {
    const page = new Page<T>();

    const cond: PrismaFindInput = { take: pageRequest.limit, skip: pageRequest.limit * pageRequest.page };

    if (whereInput) {
      cond.where = whereInput;
    }

    if (orderBy) {
      cond.orderBy = orderBy;
    }

    if (include) {
      cond.include = include;
    }

    const content: T[] = await prisma[model].findMany(cond);

    if (pageRequest.page > 1 && content.length === 0) {
      throw new NotFoundException('Page not found');
    }

    let total: number;

    if (whereInput) {
      total = await prisma[model].count({ where: whereInput });
    } else {
      total = await prisma[model].count();
    }

    const totalPages = Math.ceil(total / pageRequest.limit);

    page.content = content;
    page.current = pageRequest.page;
    page.total = totalPages;
    page.previous = pageRequest.page - 1 >= 0 && pageRequest.page - 1 < totalPages ? pageRequest.page - 1 : null;
    page.next = pageRequest.page + 1 < totalPages && pageRequest.page + 1 > 0 ? pageRequest.page + 1 : null;

    return page;
  }

  /**
   * Maps the content of this page using the provided mapper function.
   * @param mapper - The function to transform each entity in the page.
   */
  public map<D>(mapper: (entity: T) => D): Page<D> {
    const mappedPage = new Page<D>();
    mappedPage.content = [];
    mappedPage.current = this.current;
    mappedPage.total = this.total;
    mappedPage.previous = this.previous;
    mappedPage.next = this.next;
    mappedPage.content = this.content.map(mapper);

    return mappedPage;
  }
}
