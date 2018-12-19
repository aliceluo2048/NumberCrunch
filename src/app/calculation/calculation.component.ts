import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-calculation",
  templateUrl: "./calculation.component.html",
  styleUrls: ["./calculation.component.css"]
})
export class CalculationComponent implements OnInit {
  expression: string = "";
  historyExp: string[] = [];
  historyEva: string[] = [];
  historyIndex: number = 0;
  errorText: string = "";
  displayHistory = true;
  variables: { [id: string] : any } = {};
  constructor() {}
  
  ngOnInit() {}

  isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  tokenize(s: string) {
    let arr = [];
    let i = 0;
    while (i < s.length) {
      
      if (this.isDigit(s[i]) || s[i] == ".") {
        let seen = false 
        let start = i 
        while (i < s.length && this.isDigit(s[i]) || s[i] == ".") {
          if (s[i] == ".") {
            if (seen) {
              throw "Only one decimal point allowed"
            }
            seen = true 
          }
          i++
        }
        let num = Number(s.slice(start, i))
      /*  let num = 0;
        let seen = false;
        let fraction = 1 / 10;
        while ((i < s.length && this.isDigit(s[i])) || s[i] == ".") {
          if (s[i] == ".") {
            if (seen) {
              throw "Only one decimal point allowed";
            }
            seen = true;
            i++;
          } else {
            if (seen) {
              num += Number(s[i]) * fraction;
              fraction *= 1/10;
            } else {
              num *= 10;
              num += Number(s[i]);
            }
            i++;
          }
        }*/
        arr.push({ sym: "num", num: num });
      } 
      else if (/[a-zA-Z]/.test(s[i])){
        let start = i 
        while (i < s.length &&  /[a-zA-Z]/.test(s[i]) || this.isDigit(s[i])) {
          i++
        }
        let alpha = s.slice(start, i) 
        arr.push({sym: "alpha", alpha: alpha })
      }
      else {
        if (s[i] != " ") {
          arr.push({ sym: String(s[i]) });
        }
        i++;
      }
    }
    arr.push({ sym: "end" });
    return arr;
  }
  /**
   * alpha = [a-zA-Z][a-zA-z0-9]*
   *
   * number = [0-9]+
   *
   * primary = alpha | number | "(" arith ")"
   *
   * unary = primary | "+" unary | "-" unary
   *
   * pow = unary | unary '^' pow
   *
   * mult = pow | mult "*" pow | mult "/" pow
   *
   * arith = mult | arith "+" mult | arith "-" mult
   *
   * assign = alpha "=" arith
   */

   parseLetter(r: TokenReader) {
    if (r.current().sym != "alpha") {
      throw "invalid expression"
    } 
    /* if (r.current().alpha in this.variables) {
   
      return {op: "num", num: this.variables[r.current().sym]}
    }  */
    let letter = r.current().alpha
    r.advance()
    return { op: 'alpha', alpha: letter }

   }

  parseNumber(r: TokenReader) {
    if (r.current().sym != "num" && r.current().sym!="alpha") {
      throw "Expected number";
    }
    else if (r.current().sym == "alpha")  {
      return this.parseLetter(r)
    }
    else { let num = r.current().num;
    r.advance();
    return { op: "num", num: num };
    }
  }
  parsePrimary(r: TokenReader) {
    if (r.current().sym == "(") {
      r.advance();
      let tree = this.parseArith(r);
      if (r.current().sym != ")") {
        throw "Expected ')'";
      }
      r.advance();
      return tree;
    } else {
      return this.parseNumber(r);
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
      return this.parsePrimary(r);
    }
  }

  parsePow(r: TokenReader) {
    let left = this.parseUnary(r);
    if (r.current().sym == "^") {
      r.advance();
      let right = this.parsePow(r);
      return { op: "^", left: left, right: right };
    } else {
      return left;
    }
  }

  parseMult(r: TokenReader) {
    let left = this.parsePow(r);
    while (r.current().sym == "*" || r.current().sym == "/") {
      let sym = r.current().sym;
      r.advance();
      let right = this.parsePow(r);
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
    let left = this.parseArith(r)
    while (r.current().sym == "=") {
      let sym = r.current().sym
      r.advance()
      let right = this.parseArith(r)
      let tree = { op: sym, left:  left, right: right}
      left = tree 
    }
    return left 
  }
  parse(s: string) {
    let tokens = this.tokenize(s);
    let reader = new TokenReader(tokens);
    let tree = this.parseAssign(reader);
    if (reader.current().sym != "end") {
      throw "Unexpected token at end of string";
    }
    return tree;
  }

  evaluate(t: any) {
    switch (t.op) {
      case = "alpha" : {
        if (t.alpha in this.variables) {
          
        }
      }
      case "=": {
        let res = this.evaluate(t.right)
        this.variables[t.left.alpha] = res
        return res
      }
      case "num": {
        return t.num;
      }
      case "pos": {
        return this.evaluate(t.child);
      }
      case "neg": {
        return -this.evaluate(t.child);
      }
      case "^": {
        return Math.pow(this.evaluate(t.left), this.evaluate(t.right));
      }
      case "*": {
        return this.evaluate(t.left) * this.evaluate(t.right);
      }
      case "/": {
        return this.evaluate(t.left) / this.evaluate(t.right);
      }
      case "-": {
        return this.evaluate(t.left) - this.evaluate(t.right);
      }
      case "+": {
        return this.evaluate(t.left) + this.evaluate(t.right);
      }
    }
  }

  doCalc(input) {
    try {
      if (input.length != 0) {
        let parseTree = this.parse(input);
        let result = this.evaluate(parseTree);
        this.expression = "";
        this.displayHistory = true;
        this.historyExp.push(input);
        this.historyEva.push(" = " + result);
        this.historyIndex = this.historyExp.length;
      }
      this.errorText = "";
    } catch (ex) {
      this.errorText = String(ex);
    }
  }
  clearInput(){
    this.expression = ""
  }

  prevHistory() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
    }
    if (
      this.historyExp &&
      this.historyIndex >= 0 &&
      this.historyIndex < this.historyExp.length
    ) {
      this.expression = this.historyExp[this.historyIndex];
    }
  }

  nextHistory() {
    if (this.historyIndex < this.historyExp.length - 1) {
      this.historyIndex++;
    }
    if (
      this.historyExp &&
      this.historyIndex >= 0 &&
      this.historyIndex < this.historyExp.length
    ) {
      this.expression = this.historyExp[this.historyIndex];
    }
  }
  clearHistory() {
    this.historyEva = [];
    this.historyExp = [];
    this.displayHistory = false;
  }
}

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

  advance() {
    this.index += 1;
  }
}
