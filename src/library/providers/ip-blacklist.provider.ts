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
    } else if (this.isIPv6Pattern(ip)) {
      binary = this.ipv6ToBinary(ip);
    } else {
      return false;
    }

    return this.checkTrie(binary, this.trie, 0);
  }

  /**
   * Rebuild the IP adresses tree
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
      const binary = this.patternToBinary(pattern);
      this.insertIntoTrie(binary);
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
    } else {
      throw new Error(`Invalid IP pattern: ${pattern}`);
    }
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
    return /^([0-9a-fA-F]{1,4}|\*)?(:[0-9a-fA-F]{1,4}|\*){0,7}$/.test(pattern);
  }

  /**
   * Converts an IPv4 pattern to a 32-bit binary string.
   */
  private ipv4ToBinary(pattern: string): string {
    const parts = pattern.split('.');
    let binary = '';

    for (const part of parts) {
      if (part === '*') {
        binary += '*'.repeat(32);
      } else {
        const num = parseInt(part, 10);
        if (num < 0 || num > 255) {
          throw new Error(`Invalid IPv4 part: ${part}`);
        }
        binary += num.toString(2).padStart(32, '0');
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
   * Inserts a binary IP representation into the trie.
   */
  private insertIntoTrie(binary: string) {
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
    const possibleBits = [bit, '*'].filter(b => node.children[b]);
    for (const b of possibleBits) {
      if (this.checkTrie(binary, node.children[b], index + 1)) {
        return true;
      }
    }

    return false;
  }
}
