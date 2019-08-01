
class TokenReader {
    tokens: any[];
    index: number;
  
    constructor(tokens: any[]) {
      this.tokens = tokens;
      this.index = 0;
    }
  
    current() {
      return this.tokens[this.index];
    }
    next() {
      return this.tokens[this.index + 1];
    }
  
    advance() {
      this.index++;
    }
}

class Parser {
    isDigit(c: string) {
        return c >= "0" && c <= "9";
      }
    
    tokenize(s: string) {
        let arr = [];
        let i = 0;
        while (i < s.length) {
          if (this.isDigit(s[i]) || s[i] == ".") {
            let seen = false;
            let start = i;
            while ((i < s.length && this.isDigit(s[i])) || s[i] == ".") {
              if (s[i] == ".") {
                if (seen) {
                  throw "Only one decimal point allowed";
                }
                seen = true;
              }
              i++;
            }
            let num = Number(s.slice(start, i));
            arr.push({ sym: "num", num: num });
          } else if (/[a-zA-Z]/.test(s[i])) {
            let start = i;
            while ((i < s.length && /[a-zA-Z]/.test(s[i])) || this.isDigit(s[i])) {
              i++;
            }
            let id = s.slice(start, i);
            arr.push({ sym: "id", id: id });
          } else {
            if (s[i] != " ") {
              arr.push({ sym: String(s[i]) });
            }
            i++;
          }
        }
        arr.push({ sym: "end" });
        return arr;
      }
    
    parseId(r: TokenReader) {
        if (r.current().sym != "id") {
          throw "Expected variable name";
        }
        let idName = r.current().id;
        if (idName == "clear") {
          throw "Cannot name a variable after an action";
        }
        r.advance();
        return { op: "id", id: idName };
      }
    
      parseNumber(r: TokenReader) {
        if (r.current().sym != "num") {
          throw "Expected number";
        }
        let num = r.current().num;
        r.advance();
        return { op: "num", num: num };
      }
    
      parsePrimary(r: TokenReader) {
        if (r.current().sym == "(") {
          r.advance();
          let tree = this.parseComma(r);
          if (r.current().sym != ")") {
            throw "Expected ')'";
          }
          r.advance();
          return tree;
        } else if (r.current().sym == "num") {
          return this.parseNumber(r);
        } else if (r.current().sym == "id") {
          if (r.next().sym == "(") {
            let op = "func";
            let left = this.parseId(r);
            let right = this.parsePrimary(r);
            return { op, left: left, right: right };
          } else {
            return this.parseId(r);
          }
        } else {
          throw "Expected number, variable name, or '('";
        }
      }
    
      parseFactorial(r: TokenReader) {
        let tree = this.parsePrimary(r);
        while (r.current().sym == "!") {
          r.advance();
          tree = { op: "!", child: tree };
        }
        return tree;
      }
    
      parsePow(r: TokenReader) {
        let left = this.parseFactorial(r);
        if (r.current().sym == "^") {
          r.advance();
          let right = this.parseFactorial(r);
          return { op: "^", left: left, right: right };
        } else {
          return left;
        }
      }
    
      parseUnary(r: TokenReader) {
        if (r.current().sym == "+") {
          r.advance();
          let tree = this.parseUnary(r);
          return { op: "pos", child: tree };
        } else if (r.current().sym == "-") {
          r.advance();
          let tree = this.parseUnary(r);
          return { op: "neg", child: tree };
        } else {
          return this.parsePow(r);
        }
      }
    
      parseMult(r: TokenReader) {
        let left = this.parseUnary(r);
        while (r.current().sym == "*" || r.current().sym == "/") {
          let sym = r.current().sym;
          r.advance();
          let right = this.parseUnary(r);
          let tree = { op: sym, left: left, right: right };
          left = tree;
        }
        return left;
      }
    
      parseArith(r: TokenReader) {
        let left = this.parseMult(r);
        while (r.current().sym == "+" || r.current().sym == "-") {
          let sym = r.current().sym;
          r.advance();
          let right = this.parseMult(r);
          let tree = { op: sym, left: left, right: right };
          left = tree;
        }
        return left;
      }
    
      parseAssign(r: TokenReader) {
        let left = this.parseArith(r);
        if (r.current().sym == "=") {
          r.advance();
          let right = this.parseAssign(r);
          return { op: "=", left: left, right: right };
        }
        return left;
      }
    
      parseComma(r: TokenReader) {
        if (r.next() == "end") {
          r.advance();
          return;
        }
        let left = this.parseAssign(r);
        if (r.current().sym == ",") {
          r.advance();
          let right = this.parseComma(r);
          return { op: ",", left: left, right: right };
        }
        return left;
      }
    
      parse(s: string) {
        let tokens = this.tokenize(s);
        let reader = new TokenReader(tokens);
        let tree = this.parseComma(reader);
        if (reader.current().sym != "end") {
          throw "Unable to parse expression. Please enter a valid expression";
        }
        return tree;
      }
}
export { Parser };