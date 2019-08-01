import { Injectable } from '@angular/core';
import { variables, functions } from "./builtin"

@Injectable({
  providedIn: 'root'
})

export class EvaluatorService {

  constructor() { }

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

  bindTree(tree: any, args: any) {
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

  evaluate(t: any, args?: any) {
    switch (t.op) {
      case "arg": {
        return args[t.pos];
      }
      case "id": {
        if (!(t.id in variables) || !t.id == args) {
          if (t.id in functions) {
            throw "Variable '" + t.id + "' is undefined (it is a function)";
          } else {
            throw "Variable '" + t.id + "' is undefined";
          }
        }
        return variables[t.id];
      }
      case "builtin": {
        return t.func(args);
      }
      case "func": {
        if (!(t.left.id in functions)) {
          throw "Function '" + t.left.id + "' undefined";
        }
        let valueNodes = this.commaTreeToArray(t.right);
        let values = [];
        for (let node of valueNodes) {
          values.push(this.evaluate(node, args));
        }
        let f = functions[t.left.id];
        if (f.argCount != undefined) { 
          if (values.length != f.argCount) {
            throw values.length +
              " argument(s) provided to function '" + t.left.id +
              "' which requires " + f.argCount;
          }
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
          functions[t.left.left.id] = {
            tree: this.bindTree(t.right, names),
            argCount: names.length
          };
          return "";
        }
        if (t.left.op != "id") {
          throw "Left side of assignment must be a variable name";
        }
        let res = this.evaluate(t.right);
        variables[t.left.id] = res;
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
        return Math.pow(this.evaluate(t.left, args), this.evaluate(t.right, args));
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
}
