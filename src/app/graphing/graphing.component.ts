import { Component, ViewChild, ElementRef, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-graphing",
  templateUrl: "./graphing.component.html",
  styleUrls: ["./graphing.component.css"]
})
export class GraphingComponent implements OnInit {
  @ViewChild("myCanvas") canvasRef: ElementRef;
  
  constructor() {}

  ngOnInit() {}

  graphFunction(f, low_x, high_x) {
    let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext("2d");
    let canvas_width = ctx.canvas.clientWidth;
    let canvas_height = ctx.canvas.clientHeight - 5;
    let num_x_intervals = Math.abs(high_x - low_x);
    let x_interval_size = canvas_width / num_x_intervals;

    let x_origin = Math.abs(low_x);
    if (high_x <= 0 || low_x >= 0) {
      if (high_x == 0) {
        x_origin = num_x_intervals
      } else {
        x_origin = 0
      } 
    }
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    ctx.save()

    let left = low_x;
    let right = high_x;
    let stepFraction = 0.01;
    if (num_x_intervals > 1000) {
      stepFraction = num_x_intervals / canvas_width;
    }
    
    let prevX = left;
    let prevY = f(prevX);
    let lower_y_bound = prevY;
    let upper_y_bound = prevY;
    let y_points = [];

    for (let x = (left + stepFraction); x <= right; x+= stepFraction) {
      let y = f(x);
      if (isFinite(y)) {
        if (!isFinite(lower_y_bound)) {
          lower_y_bound = y;
        } else if (!isFinite(upper_y_bound)){
          upper_y_bound = y;
        } else {
          lower_y_bound = Math.min(y, lower_y_bound);
          upper_y_bound = Math.max(y, upper_y_bound);
        }
      }
      y_points.push(y);
    }
  
    let num_y_intervals = Math.abs(upper_y_bound - lower_y_bound);
    let y_interval_size = canvas_height / num_y_intervals;
    let y_origin = Math.abs(upper_y_bound);
    let needsYAdjustment = false;
    if (upper_y_bound < -1 || lower_y_bound > 1) {
      needsYAdjustment = true; 
      y_origin = (upper_y_bound <= -1) ? 0 : num_y_intervals;
    } 
  
    //draw x and y axis
    ctx.beginPath()
    if (isNaN(num_y_intervals)) {
      ctx.moveTo(0, canvas_height);
      ctx.lineTo(canvas_width, canvas_height);
    } else {
      ctx.moveTo(0, y_origin * y_interval_size);
      ctx.lineTo(canvas_width, y_origin * y_interval_size);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(x_origin * x_interval_size, 0);
    ctx.lineTo(x_origin * x_interval_size, canvas_height);
    ctx.stroke();
    ctx.closePath();
    
    let x_adjustment =  0;
    if (high_x <= 0) {
      x_adjustment = Math.abs(high_x);
    } else if (low_x >= 0) {
      x_adjustment = -low_x;
    } 

    let yAdjustment = 0;
    if (needsYAdjustment) {
      let yAdjustmentSize = 50;
      y_interval_size = (canvas_height - yAdjustmentSize) / num_y_intervals;
      if (lower_y_bound >= 1) {
        yAdjustment = -lower_y_bound;
        if (low_x >= 1) {
          ctx.translate(x_origin * x_interval_size, canvas_height - yAdjustmentSize);
        } else if (high_x <= -1) {
          ctx.translate(canvas_width, canvas_height - yAdjustmentSize);
        }
        if (!x_adjustment) {
          ctx.translate(x_origin * x_interval_size, y_origin * y_interval_size);
        }
      }
      if (upper_y_bound <= -1) {
        yAdjustment = -upper_y_bound;
        if (low_x >= 1) {
          ctx.translate(x_origin * x_interval_size, yAdjustmentSize);
        }
        if (high_x <= -1) {
          ctx.translate(canvas_width, yAdjustmentSize);
        }
      }
    } else {
      ctx.translate(x_origin * x_interval_size, y_origin * y_interval_size);
    }

    //graph function
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
  
    let i = 0;

    for (let x = left + stepFraction; x <= right; x += stepFraction) {
      let y = y_points[i];
      ctx.moveTo((prevX + x_adjustment)* x_interval_size + 0.5, (prevY + yAdjustment) * -y_interval_size + 0.5);
      ctx.lineTo((x + x_adjustment) * x_interval_size + 0.5, (y + yAdjustment) * -y_interval_size + 0.5);
      ctx.stroke();
      prevX = x;
      prevY = y;
      i++;
    }
     ctx.restore();
  }
}

