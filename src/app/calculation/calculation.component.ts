import { Component, ViewChild, AfterViewInit} from "@angular/core";
import { GraphingComponent } from "../graphing/graphing.component";

@Component({
  selector: "app-calculation",
  templateUrl: "./calculation.component.html",
  styleUrls: ["./calculation.component.css"]
})
export class CalculationComponent implements AfterViewInit {
  @ViewChild("graphingComponent") graphingComponent: GraphingComponent;
  expression: string = "";
  historyExp: any[] = [];
  historyIndex: number = 0;
  errorText: string = "";
  variables: {} = {};
  functions: {} = {};
  constructor() {}

  ngAfterViewInit() {
    this.variables["E"] = Math.E;
    this.variables["pi"] = Math.PI;
    this.addBuiltinFunc("exp", 1, (args: number[]) => Math.exp(args[0]));
    this.addBuiltinFunc("log", 1, (args: number[]) => Math.log(args[0]));
    this.addBuiltinFunc("sqrt", 1, (args: number[]) => Math.sqrt(args[0]));
    this.addBuiltinFunc("sin", 1, (args: number[]) => Math.sin(args[0]));
    this.addBuiltinFunc("cos", 1, (args: number[]) => Math.cos(args[0]));
    this.addBuiltinFunc("tan", 1, (args: number[]) => Math.tan(args[0]));
    this.addBuiltinFunc("asin", 1, (args: number[]) => Math.asin(args[0]));
    this.addBuiltinFunc("acos", 1, (args: number[]) => Math.acos(args[0]));
    this.addBuiltinFunc("atan", 1, (args: number[]) => Math.atan(args[0]));
  }

  addBuiltinFunc(name: string, argCount: number, func: any) {
    this.functions[name] = {
      argCount: argCount,
      tree: { op: "builtin", func: func }
    };
  }

  isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  factorial(n: number) {
    n = Math.floor(n);
    if (n < 0) {
      return NaN;
    }
    if (n > 500) {
      return NaN;
    }
    let fact = 1;
    while (n > 1) {
      fact *= n;
      n -= 1;
    }
    return fact;
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
  /** Grammar
   * id = [a-zA-Z_][a-zA-z0-9_]*
   *
   * number = [0-9]+
   *
   * func = id "(" comma ")" 
   *
   * primary = id | number | "(" comma ")" | func
   *
   * factorial = primary | factorial "!"
   *
   * pow = factorial | factorial '^' pow
   *
   * unary = pow| "+" unary | "-" unary
   *
   * mult = unary | mult "*" unary | mult "/" unary
   *
   * arith = mult | arith "+" mult | arith "-" mult
   *
   * assign = arith | arith "=" assign
   *
   * comma = assign | assign "," comma
   */

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

  bindTree(tree, args) {
    if (tree.op == "id") {
      let argPos = args.indexOf(tree.id);
      if (argPos != -1) {
        return { op: "arg", pos: argPos };
      }
    }
    let newTree = Object.assign({}, tree);
    if (tree.left) {
      newTree.left = this.bindTree(tree.left, args);
    }
    if (tree.right) {
      newTree.right = this.bindTree(tree.right, args);
    }
    if (tree.child) {
      newTree.child = this.bindTree(tree.child, args);
    }
    return newTree;
  }

  commaTreeToArrayInternal(t: any, arr: any[]) {
    if (t.op == ",") {
      this.commaTreeToArrayInternal(t.left, arr);
      this.commaTreeToArrayInternal(t.right, arr);
    } else {
      arr.push(t);
    }
  }

  commaTreeToArray(t: any) {
    let arr = [];
    this.commaTreeToArrayInternal(t, arr);
    return arr;
  }

  evaluate(t: any, args?) {
    switch (t.op) {
      case "arg": {
        return args[t.pos];
      }
      case "id": {
        if (!(t.id in this.variables) || !t.id == args) {
          if (t.id in this.functions) {
            throw "Variable '" + t.id + "' is undefined (it is a function)";
          } else {
            throw "Variable '" + t.id + "' is undefined";
          }
        }
        return this.variables[t.id];
      }
      case "builtin": {
        return t.func(args);
      }
      case "func": {
        if (!(t.left.id in this.functions)) {
          throw "Function '" + t.left.id + "' undefined";
        }
        let valueNodes = this.commaTreeToArray(t.right);
        let values = [];
        for (let node of valueNodes) {
          values.push(this.evaluate(node, args));
        }
        let f = this.functions[t.left.id];
        if (values.length != f.argCount) {
          throw values.length +
            " argument(s) provided to function '" +
            t.left.id +
            "' which requires " +
            f.argCount;
        }
        return this.evaluate(f.tree, values);
      }
      case "=": {
        if (t.left.op == "func") {
          let nameNodes = this.commaTreeToArray(t.left.right);
          let names = [];
          for (let node of nameNodes) {
            if (node.op != "id") {
              throw "Only variable names are allowed inside function parentheses";
            }
            if (names.includes(node.id)) {
              throw "Argument '" + node.id + "' is used more than once";
            }
            names.push(node.id);
          }
          this.functions[t.left.left.id] = {
            tree: this.bindTree(t.right, names),
            argCount: names.length
          };
          return "";
        }
        if (t.left.op != "id") {
          throw "Left side of assignment must be a variable name";
        }
        let res = this.evaluate(t.right);
        this.variables[t.left.id] = res;
        return res;
      }
      case ",": {
        throw "Unexpected ','";
      }

      case "num": {
        return t.num;
      }
      case "!": {
        return this.factorial(this.evaluate(t.child, args));
      }
      case "pos": {
        return this.evaluate(t.child, args);
      }
      case "neg": {
        return -this.evaluate(t.child, args);
      }
      case "^": {
        return Math.pow(
          this.evaluate(t.left, args),
          this.evaluate(t.right, args)
        );
      }
      case "*": {
        return this.evaluate(t.left, args) * this.evaluate(t.right, args);
      }
      case "/": {
        return this.evaluate(t.left, args) / this.evaluate(t.right, args);
      }
      case "-": {
        return this.evaluate(t.left, args) - this.evaluate(t.right, args);
      }
      case "+": {
        return this.evaluate(t.left, args) + this.evaluate(t.right, args);
      }
    }
  }

  doCalc(input: string) {
    try {
      if (input.length != 0) {
        if (input.trim() == "clear") {
          //this.expression = "";
          return this.clearHistory();
        }
        let parseTree = this.parse(input);
        let showResult = this.toGraph(parseTree)
        let result = ""
        if (showResult) {
          result = this.evaluate(parseTree);
        }
        this.expression = "";
        this.historyExp.push({
          expression: input,
          result: result,
          isNumber: typeof result == "number"
        });
        this.historyIndex = this.historyExp.length;
      }
      this.errorText = "";
    } catch (ex) {
      this.errorText = ex;
    }
  }

  toGraph(parseTree) {
    if (parseTree.left && parseTree.left.id == "graph") {
      if (parseTree.right.op != "," || parseTree.right.right.op != ",") {
        throw "Three arguments required to graph a function";
      }
      let lowx = this.evaluate(parseTree.right.right.left);
      let upperx = this.evaluate(parseTree.right.right.right);
      if (upperx < lowx) {
        throw "upper bound of x must be less than/equal to lower bound";
      }
      this.startGraph(parseTree.right.left.id, lowx, upperx);
      return false
    }
    return true
  }

  startGraph(expression: string, lowx, upperx) {
    if (!(expression in this.functions)) {
      alert(expression + " is not a defined function");
      return;
    }
    let f = this.functions[expression];
    if (f.argCount != 1) {
      alert(expression + " takes " + f.argCount + " arguments! can only graph 1 var");
      return;
    }
    this.graphingComponent.graphFunction(
      x => { return this.evaluate(f.tree, [x]); }, lowx, upperx
    );
  }

  clearInput() {
    this.expression = "";
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
      this.expression = this.historyExp[this.historyIndex].expression;
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
      this.expression = this.historyExp[this.historyIndex].expression;
    }
  }

  clearHistory() {
    this.expression = "";
    this.historyExp = [];
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
  next() {
    return this.tokens[this.index + 1];
  }

  advance() {
    this.index++;
  }
}
