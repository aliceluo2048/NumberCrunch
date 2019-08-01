import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class HistoryService {

  historyExp: any[] = [];
  historyIndex: number = 0;
  expression: string = "";

  storeExpression(expression, result){
    this.historyExp.push({
      expression,
      result,
      isNumber: typeof result == "number"
    })
    this.historyIndex = this.historyExp.length;
    this.expression = "";
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
