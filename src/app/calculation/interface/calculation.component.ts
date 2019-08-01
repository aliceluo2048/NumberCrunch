import { Component, ViewChild, AfterViewInit} from "@angular/core";
import { GraphingComponent } from "../../graphing/graphing.component";
import { Parser } from "./../parser";
import { functions } from "./../builtin";
import { EvaluatorService } from "./../evaluator.service"
import { HistoryService } from "./../history.service";

@Component({
  selector: "app-calculation",
  templateUrl: "./calculation.component.html",
  styleUrls: ["./calculation.component.css"]
})
export class CalculationComponent implements AfterViewInit {
  @ViewChild("graphingComponent") graphingComponent: GraphingComponent;
  errorText: string = "";
  constructor(private evaluatorService: EvaluatorService, private historyService: HistoryService) {}

  ngAfterViewInit() {}


  doCalc(input: string) {
    try {
      if (input.length != 0) {
        if (input.trim() == "clear") {
          return this.historyService.clearHistory();
        }
        let parser = new Parser();
        let parseTree = parser.parse(input);
        let showResult = this.toGraph(parseTree)
        let result = ""
        if (showResult) {
          result = this.evaluatorService.evaluate(parseTree);
        }
        this.historyService.storeExpression(input, result)  
      }
      this.errorText = "";
    } catch (ex) {
        this.errorText = ex;
    }
  }

  toGraph(parseTree: any) {
    if (parseTree.left && parseTree.left.id == "graph") {
      if (parseTree.right.op != "," || parseTree.right.right.op != ",") {
        throw "Three arguments required to graph a function";
      }
      let lowx = this.evaluatorService.evaluate(parseTree.right.right.left);
      let upperx = this.evaluatorService.evaluate(parseTree.right.right.right);
      if (upperx < lowx) {
        throw "upper bound of x must be less than/equal to lower bound";
      }
      this.startGraph(parseTree.right.left.id, lowx, upperx);
      return false
    }
    return true
  }

  startGraph(expression: string, lowx: number, upperx: number) {
    if (!(expression in functions)) {
      alert(expression + " is not a defined function");
      return;
    }
    let f = functions[expression];
    if (f.argCount != 1) {
      alert(expression + " takes " + f.argCount + " arguments! can only graph 1 var");
      return;
    }
    this.graphingComponent.graphFunction(
      x => { return this.evaluatorService.evaluate(f.tree, [x]); }, lowx, upperx
    );
  }
}