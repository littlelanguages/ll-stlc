import * as AbstractScanner from "https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.1.1/abstract-scanner.ts";

export type Token = AbstractScanner.Token<TToken>;

export class Scanner extends AbstractScanner.Scanner<TToken> {
  constructor(input: string) {
    super(input, TToken.ERROR);
  }

  next() {
    if (this.currentToken[0] !== TToken.EOS) {
      while (0 <= this.nextCh && this.nextCh <= 32) {
        this.nextChar();
      }

      let state = 0;
      while (true) {
        switch (state) {
          case 0: {
            if (this.nextCh === 61) {
              this.markAndNextChar();
              state = 1;
              break;
            } else if (this.nextCh === 101) {
              this.markAndNextChar();
              state = 2;
              break;
            } else if (this.nextCh === 105) {
              this.markAndNextChar();
              state = 3;
              break;
            } else if (this.nextCh === 59) {
              this.markAndNextChar();
              state = 4;
              break;
            } else if (this.nextCh === 114) {
              this.markAndNextChar();
              state = 5;
              break;
            } else if (this.nextCh === 108) {
              this.markAndNextChar();
              state = 6;
              break;
            } else if (this.nextCh === 45) {
              this.markAndNextChar();
              state = 7;
              break;
            } else if (this.nextCh === 92) {
              this.markAndNextChar();
              state = 8;
              break;
            } else if (this.nextCh === 70) {
              this.markAndNextChar();
              state = 9;
              break;
            } else if (this.nextCh === 84) {
              this.markAndNextChar();
              state = 10;
              break;
            } else if (this.nextCh === 41) {
              this.markAndNextChar();
              state = 11;
              break;
            } else if (this.nextCh === 40) {
              this.markAndNextChar();
              state = 12;
              break;
            } else if (this.nextCh === 47) {
              this.markAndNextChar();
              state = 13;
              break;
            } else if (this.nextCh === 42) {
              this.markAndNextChar();
              state = 14;
              break;
            } else if (this.nextCh === 43) {
              this.markAndNextChar();
              state = 15;
              break;
            } else if (
              65 <= this.nextCh && this.nextCh <= 69 ||
              71 <= this.nextCh && this.nextCh <= 83 ||
              85 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 104 || this.nextCh === 106 ||
              this.nextCh === 107 || 109 <= this.nextCh && this.nextCh <= 113 ||
              115 <= this.nextCh && this.nextCh <= 122
            ) {
              this.markAndNextChar();
              state = 16;
              break;
            } else if (this.nextCh === -1) {
              this.markAndNextChar();
              state = 17;
              break;
            } else if (48 <= this.nextCh && this.nextCh <= 57) {
              this.markAndNextChar();
              state = 18;
              break;
            } else {
              this.markAndNextChar();
              this.attemptBacktrackOtherwise(TToken.ERROR);
              return;
            }
          }
          case 1: {
            if (this.nextCh === 61) {
              this.nextChar();
              state = 19;
              break;
            } else {
              this.setToken(0);
              return;
            }
          }
          case 2: {
            if (this.nextCh === 108) {
              this.nextChar();
              state = 20;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 107 ||
              109 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 3: {
            if (this.nextCh === 102) {
              this.nextChar();
              state = 21;
              break;
            } else if (this.nextCh === 110) {
              this.nextChar();
              state = 22;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 101 ||
              103 <= this.nextCh && this.nextCh <= 109 ||
              111 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 4: {
            this.setToken(4);
            return;
          }
          case 5: {
            if (this.nextCh === 101) {
              this.nextChar();
              state = 23;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 6: {
            if (this.nextCh === 101) {
              this.nextChar();
              state = 24;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 7: {
            if (this.nextCh === 62) {
              this.nextChar();
              state = 25;
              break;
            } else if (48 <= this.nextCh && this.nextCh <= 57) {
              this.nextChar();
              state = 18;
              break;
            } else if (this.nextCh === 45) {
              this.nextChar();
              state = 26;
              break;
            } else {
              this.setToken(15);
              return;
            }
          }
          case 8: {
            this.setToken(8);
            return;
          }
          case 9: {
            if (this.nextCh === 97) {
              this.nextChar();
              state = 27;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              98 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 10: {
            if (this.nextCh === 114) {
              this.nextChar();
              state = 28;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 113 ||
              115 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 11: {
            this.setToken(11);
            return;
          }
          case 12: {
            this.setToken(12);
            return;
          }
          case 13: {
            this.setToken(13);
            return;
          }
          case 14: {
            this.setToken(14);
            return;
          }
          case 15: {
            this.setToken(16);
            return;
          }
          case 16: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 17: {
            this.setToken(20);
            return;
          }
          case 18: {
            if (48 <= this.nextCh && this.nextCh <= 57) {
              this.nextChar();
              state = 18;
              break;
            } else {
              this.setToken(18);
              return;
            }
          }
          case 19: {
            this.setToken(17);
            return;
          }
          case 20: {
            if (this.nextCh === 115) {
              this.nextChar();
              state = 29;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 114 ||
              116 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 21: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(2);
              return;
            }
          }
          case 22: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(3);
              return;
            }
          }
          case 23: {
            if (this.nextCh === 99) {
              this.nextChar();
              state = 30;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 || this.nextCh === 97 ||
              this.nextCh === 98 || 100 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 24: {
            if (this.nextCh === 116) {
              this.nextChar();
              state = 31;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 115 ||
              117 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 25: {
            this.setToken(7);
            return;
          }
          case 26: {
            if (
              0 <= this.nextCh && this.nextCh <= 9 ||
              11 <= this.nextCh && this.nextCh <= 255
            ) {
              this.nextChar();
              state = 26;
              break;
            } else {
              this.next();
              return;
            }
          }
          case 27: {
            if (this.nextCh === 108) {
              this.nextChar();
              state = 32;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 107 ||
              109 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 28: {
            if (this.nextCh === 117) {
              this.nextChar();
              state = 33;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 116 ||
              118 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 29: {
            if (this.nextCh === 101) {
              this.nextChar();
              state = 34;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 30: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(5);
              return;
            }
          }
          case 31: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(6);
              return;
            }
          }
          case 32: {
            if (this.nextCh === 115) {
              this.nextChar();
              state = 35;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 114 ||
              116 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 33: {
            if (this.nextCh === 101) {
              this.nextChar();
              state = 36;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 34: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(1);
              return;
            }
          }
          case 35: {
            if (this.nextCh === 101) {
              this.nextChar();
              state = 37;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(19);
              return;
            }
          }
          case 36: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(10);
              return;
            }
          }
          case 37: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 16;
              break;
            } else {
              this.setToken(9);
              return;
            }
          }
        }
      }
    }
  }
}

export function mkScanner(input: string): Scanner {
  return new Scanner(input);
}

export enum TToken {
  Equal,
  Else,
  If,
  In,
  Semicolon,
  Rec,
  Let,
  DashGreaterThan,
  Backslash,
  False,
  True,
  RParen,
  LParen,
  Slash,
  Star,
  Dash,
  Plus,
  EqualEqual,
  LiteralInt,
  Identifier,
  EOS,
  ERROR,
}
