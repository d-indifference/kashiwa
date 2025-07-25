import { Injectable } from '@nestjs/common';

interface TrieNode {
  children: { [key: string]: TrieNode };
  isBlocked: boolean;
}

/**
 * Provider for working with IP blacklist from memory
 */
@Injectable()
export class IpBlacklistProvider {
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
  public reloadBlacklist() {
    this.trie = { children: {}, isBlocked: false };
    this.loadBlacklist();
  }

  private loadBlacklist(): void {
    const ipBlackList: string[] = global.ipBlackList as string[];

    for (const pattern of ipBlackList) {
      const binary = this.patternToBinary(pattern);
      this.insertIntoTrie(binary);
    }
  }

  private patternToBinary(pattern: string): string {
    if (this.isIPv4Pattern(pattern)) {
      return this.ipv4ToBinary(pattern);
    } else if (this.isIPv6Pattern(pattern)) {
      return this.ipv6ToBinary(pattern);
    } else {
      throw new Error(`Invalid IP pattern: ${pattern}`);
    }
  }

  private isIPv4Pattern(pattern: string): boolean {
    return /^(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)\.(\d{1,3}|\*)$/.test(pattern);
  }

  private isIPv6Pattern(pattern: string): boolean {
    return /^([0-9a-fA-F]{1,4}|\*)?(:[0-9a-fA-F]{1,4}|\*){0,7}$/.test(pattern);
  }

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
