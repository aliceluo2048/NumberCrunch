import { Pipe, PipeTransform } from '@angular/core';
@Pipe({name: 'evaluator'})
export class evaluator implements PipeTransform { 
  transform(input: string): number { 
    let sum = 0
    return sum + parseFloat(input);
  }
}