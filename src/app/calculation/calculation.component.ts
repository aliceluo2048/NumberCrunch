import { Component, OnInit } from '@angular/core';

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
  constructor() {}

  ngOnInit() {}

  isDigit(c) {
    return c >= "0" && c <= "9";
  }

  /**
   * number = (+|-)?[0-9]+
   * pow_expression = number | number '^' pow_expression | "(" arithemetic_expression ")"
   * 
   * mult_expression  = pow_expression | number "*" mult_expression | number "/"" mult_expression
   * 
   * arithemetic_expression = mult_expression | mult_expression "+" arithmetic_expression | mult_expression "-" arithmetic_expression
   * 
   */
  evaluateNumber(string, index) {
    let num = 0;

    while (
      index < string.length &&
      (this.isDigit(string[index]) || string[index] == ".")
    ) {
      if (string[index] == ".") {
        let dec = 1 / 10;
        index += 1;
        while (this.isDigit(string[index]) && index < string.length) {
          num += Number(string[index]) * dec;
          dec *= 1 / 10;
          index += 1;
        }
      } else if (this.isDigit(string[index])) {
        num *= 10;
        num += Number(string[index]);
        index += 1;
      }
    }
    return [num, index];
  }

  evaluateMultExpr(string, index) {
    let result = 1;
    let num = 1;
    let op = "*";
    let sign = 1;

    let applyOp = function() {
      num *= sign;
      sign = 1;
      if (op == "*") {
        result *= num;
        num = 1;
      } else if (op == "/") {
        result /= num;
        num = 1;
      } else if (op == "%") {
        result %= num;
        num = 1;
      }
      op = " ";
    };

    while (index < string.length) {
      if (string[index] == "(") {
        [num, index] = this.evaluateArithExpr(string, index + 1);
        index++;
        applyOp();
      } else if (this.isDigit(string[index])) {
        [num, index] = this.evaluateNumber(string, index)
        applyOp();
      } else if (string[index] == ")") {
        break;
      } else if (string[index] == "*") {
        op = "*";
        index++;
      } else if (string[index] == "/") {
        op = "/";
        index++;
      } else if (string[index] == "%") {
        op = "%";
        index++;
      } else if (op != " " && (string[index] == "+" || string[index] == "-")) {
        if (string[index] == "+") {
          sign = 1;
        } else if (string[index] == "-") {
          sign *= -1;
        }
        index++;
      } else {
        break;
      }
    }
    return [result, index];
  }

  evaluateArithExpr(string, index) {
    let result = 0;
    let num = 0;
    let sign = 1;  

    let applyOp = function() {
      if (sign == 1) {
        result += num;
        num = 0;
      } else if (sign == -1) {
        result -= num;
        num = 0;
      }
      sign = 1;
    }

    while (index < string.length) {
      if (string[index] == ")") {
        break;
      } else if (string[index] == "+") {
        index++;
      } else if (string[index] == "-") {
        sign *= -1 
        index++;
      } else {
        [num, index] = this.evaluateMultExpr(string, index);
        applyOp();
      }
    }

    return [result, index];
  }

  doCalc(input) {
    let i = 0;
    while (i < input.length) {
      input = input.replace(/\s/g, "");
      let result;
      [result, i] = this.evaluateArithExpr(input, i);
      this.expression = "";
      this.historyExp.push(input);
      this.historyEva.push(" = " + result);
      this.historyIndex = this.historyExp.length;
    }
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
}