import { Injectable } from '@nestjs/common';
import { SiteContextProvider } from '@library/providers/site-context.provider';

interface TrieNode {
  children: { [key: string]: TrieNode };
  isBlocked: boolean;
}

/**
 * Provider for working with IP blacklist from memory
 */
@Injectable()
export class IpBlacklistProvider {
  constructor(private readonly siteContext: SiteContextProvider) {}

  private trie: TrieNode = { children: {}, isBlocked: false };

  /**
   * Check if IP is globally blocked
   * @param ip Poster's IP
   */
  public isIpBlocked(ip: string): boolean {
    let binary: string;
    if (this.isIPv4Pattern(ip)) {
      binary = this.ipv4ToBinary(ip);
    } else if (this.isIPv6Pattern(ip) || ip.includes('::')) {
      const expanded = ip.includes('::') ? (this.expandIPv6(ip) ?? ip) : ip;
      if (!this.isIPv6Pattern(expanded)) {
        return false;
      }
      binary = this.ipv6ToBinary(expanded);
    } else {
      return false;
    }

    return this.checkTrie(binary, this.trie, 0);
  }

  /**
   * Rebuild the IP addresses tree
   */
  public reloadBlacklist(): void {
    this.trie = { children: {}, isBlocked: false };
    this.loadBlacklist();
  }

  /**
   * Loads the blacklist from the site context and populates the trie.
   */
  private loadBlacklist(): void {
    const ipBlackList: string[] = this.siteContext.getIpBlackList() || [];

    for (const pattern of ipBlackList) {
      if (pattern.includes('/')) {
        this.insertCidr(pattern);
      } else {
        const binary = this.patternToBinary(pattern);
        this.insertIntoTrie(binary);
      }
    }
  }

  /**
   * Converts an IP pattern to binary representation with wildcard support.
   */
  private patternToBinary(pattern: string): string {
    if (this.isIPv4Pattern(pattern)) {
      return this.ipv4ToBinary(pattern);
    } else if (this.isIPv6Pattern(pattern)) {
      return this.ipv6ToBinary(pattern);
    }
    throw new Error(`Invalid IP pattern: ${pattern}`);
  }

  /**
   * Checks whether the pattern is a valid IPv4 address with optional wildcards.
   */
  private isIPv4Pattern(pattern: string): boolean {
    return /^(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)$/.test(pattern);
  }

  /**
   * Checks whether the pattern is a valid IPv6 address with optional wildcards.
   */
  private isIPv6Pattern(pattern: string): boolean {
    try {
      const full = pattern.replace('::', ':'.repeat(8 - pattern.split(':').length + 1));
      return /^[0-9A-Fa-f:*]{1,4}(:[0-9A-Fa-f:*]{1,4}){7}$/.test(full);
    } catch {
      return false;
    }
  }

  /**
   * Converts an IPv4 pattern to a 32-bit binary string.
   */
  private ipv4ToBinary(pattern: string): string {
    const parts = pattern.split('.');
    let binary = '';

    for (const part of parts) {
      if (part === '*') {
        binary += '*'.repeat(8);
      } else {
        const num = parseInt(part, 10);
        if (num < 0 || num > 255) {
          throw new Error(`Invalid IPv4 part: ${part}`);
        }
        binary += num.toString(2).padStart(8, '0');
      }
    }

    return binary;
  }

  /**
   * Converts an IPv6 pattern to a 128-bit binary string.
   */
  private ipv6ToBinary(pattern: string): string {
    const parts = pattern.split(':').filter(Boolean);
    let binary = '';

    const missingGroups = 8 - parts.length;
    const expandedParts: string[] = [];
    let inserted = false;
    for (const part of parts) {
      if (part === '' && !inserted) {
        expandedParts.push(...Array(missingGroups.toString()).fill('*'));
        inserted = true;
      } else {
        expandedParts.push(part);
      }
    }

    for (const part of expandedParts) {
      if (part === '*') {
        binary += '*'.repeat(16);
      } else {
        const num = parseInt(part, 16) || 0;
        binary += num.toString(2).padStart(16, '0');
      }
    }

    return binary;
  }

  /**
   * Inserts a CIDR-based IP pattern into the internal trie for fast blacklist lookup
   * @param pattern The CIDR notation string representing the subnet to block
   */
  private insertCidr(pattern: string): void {
    const [ip, prefixLengthStr] = pattern.split('/');
    const prefixLength = parseInt(prefixLengthStr, 10);
    let binary: string;
    let totalBits: number;

    if (this.isIPv4Pattern(ip)) {
      totalBits = 32;
      binary = this.ipv4ToBinary(ip);
    } else if (this.isIPv6Pattern(ip) || ip.includes('::')) {
      totalBits = 128;
      const expanded = this.expandIPv6(ip);
      if (!expanded) {
        throw new Error(`Invalid CIDR address: ${pattern}`);
      }
      binary = this.ipv6ToBinary(expanded);
    } else {
      throw new Error(`Invalid CIDR address: ${pattern}`);
    }

    const maskedBinary = binary.substring(0, prefixLength).padEnd(totalBits, '*');
    this.insertIntoTrie(maskedBinary);
  }

  /**
   * Expands a compressed IPv6 address (with '::') to full 8-group representation.
   * Returns null if the address is invalid.
   */
  private expandIPv6(ip: string): string | null {
    const parts = ip.split('::');
    if (parts.length > 2) {
      return null;
    }

    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) {
      return null;
    }

    const zeros = Array(missing).fill('0');
    return [...left, ...zeros, ...right].join(':');
  }

  /**
   * Inserts a binary IP representation into the trie.
   */
  private insertIntoTrie(binary: string): void {
    let node = this.trie;
    for (const bit of binary) {
      if (!node.children[bit]) {
        node.children[bit] = { children: {}, isBlocked: false };
      }
      node = node.children[bit];
    }
    node.isBlocked = true;
  }

  /**
   * Recursively checks if a binary IP string matches any blocked path in the trie.
   */
  private checkTrie(binary: string, node: TrieNode, index: number): boolean {
    if (index === binary.length) {
      return node.isBlocked;
    }

    const bit = binary[index];
    const possibleBits: string[] = [];
    if (node.children[bit]) {
      possibleBits.push(bit);
    }
    if (node.children['*']) {
      possibleBits.push('*');
    }

    for (const b of possibleBits) {
      if (this.checkTrie(binary, node.children[b], index + 1)) {
        return true;
      }
    }

    return false;
  }
}
