import { locale, localeValidators } from './locale-en';

export type LocaleArgument = string | ((...args: string[]) => string);

export const LOCALE: Record<string, LocaleArgument> = locale;

export const V_LOCALE = localeValidators;

export const vStr = (arg: unknown): string => arg as string;
