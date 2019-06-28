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
    let ctx = (CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext("2d"))

    let canvas_width = 600;
    let canvas_height = 500;
    let num_x_intervals = Math.abs(high_x - low_x);
    let x_interval_size = canvas_width / num_x_intervals;
    let x_origin = Math.abs(low_x);
    if (high_x <= 0 || low_x >= 0) {
      x_origin = 0
    }
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    ctx.save()

    let left = low_x
    let right = high_x
    let stepFraction = 0.01
    //let stepFraction = num_x_intervals / canvas_width;
    let prevX = left
    let prevY = f(prevX)
    let lower_y_bound = prevY
    let upper_y_bound = prevY
    
    for (let x = left + stepFraction; x <= right; x += stepFraction) {
      let y = f(x)
      if (!isNaN(y)) {
        if (isNaN(lower_y_bound)) {
          lower_y_bound = y
        } else if (isNaN(upper_y_bound)){
          upper_y_bound = y
        } else {
          lower_y_bound = Math.min(y, lower_y_bound)
          upper_y_bound = Math.max(y, upper_y_bound)
        }
      }
    }

    let num_y_intervals = Math.abs(upper_y_bound - lower_y_bound)
    let y_interval_size = canvas_height / num_y_intervals
    let y_origin = Math.abs(upper_y_bound) 
    
    let needsYAdjustment = false  
    if (upper_y_bound <= -1 || lower_y_bound >= 1) {
      needsYAdjustment = true 
      y_origin = (upper_y_bound <= -1) ? 0 : num_y_intervals
    } 
    //f(x)=-2*x^2 + 3*x - 3
    //draw x and y axis
    ctx.beginPath()
    ctx.moveTo(0, y_origin * y_interval_size)
    ctx.lineTo(canvas_width, y_origin * y_interval_size)
    ctx.stroke()
    ctx.moveTo(x_origin * x_interval_size, 0)
    ctx.lineTo(x_origin * x_interval_size, canvas_height)
    ctx.stroke()
    
    let x_adjustment =  0
    if (high_x <= 0) {
      x_adjustment = num_x_intervals
    } else if (low_x >= 0) {
      x_adjustment = -low_x
    } 

    let yAdjustment = 0
    if (needsYAdjustment) {
      let yAdjustmentSize = 50 
      y_interval_size = (canvas_height - yAdjustmentSize)/num_y_intervals
      if (!x_adjustment) {
        ctx.translate(x_origin * x_interval_size, y_origin * y_interval_size)
      }
      if (lower_y_bound >= 1) {
        yAdjustment = -lower_y_bound
        if (low_x >= 1) {
          ctx.translate(x_origin * x_interval_size, canvas_height - yAdjustmentSize)
        }
        if (high_x <= -1) {
          ctx.translate(canvas_width, canvas_height - yAdjustmentSize)
        }
      }
      if (upper_y_bound <= -1) {
        yAdjustment = -upper_y_bound
        if (low_x >= 1) {
          ctx.translate(x_origin * x_interval_size, yAdjustmentSize)
        }
        if (high_x <= -1) {
          ctx.translate(canvas_width, yAdjustmentSize)
        }
      }
    } else {
      ctx.translate(x_origin * x_interval_size, y_origin * y_interval_size)
    }

    //graph function
    ctx.beginPath()
    ctx.strokeStyle = "#ff0000"
  
    for (let x = left + stepFraction; x <= right; x += stepFraction) {
      let y = f(x)
      ctx.moveTo((prevX + x_adjustment)* x_interval_size + 0.5, (prevY + yAdjustment) * -y_interval_size + 0.5)
      ctx.lineTo((x + x_adjustment) * x_interval_size + 0.5, (y + yAdjustment) * -y_interval_size + 0.5)
      ctx.stroke()
      prevX = x
      prevY = y
    }

     ctx.restore()
  }
}
/*
//x tick marks
    if (low_x >= 0) {
      for (let i = low_x ; i <= num_x_intervals; i++) {
        ctx.moveTo(i * x_interval_size + 0.5, -3)
        ctx.lineTo(i * x_interval_size + 0.5, 3)
        ctx.stroke()
      }
    } else {
        for (let i = 1; i <= upperx - 0; i++) {
          ctx.moveTo(i * x_interval_size + 0.5, -3)
          ctx.lineTo(i * x_interval_size + 0.5, 3)
          ctx.stroke()

          ctx.textAlign = "start"
          ctx.fillText("" + i, x_interval_size * i - 2, 15)
        }
        for (let i = 1; i <= 0 - lowx; i++) {
          ctx.moveTo(i * -x_interval_size + 0.5, -3)
          ctx.lineTo(i * -x_interval_size + 0.5, 3)
          ctx.stroke()

          ctx.textAlign = "start"
          ctx.fillText("-" + i, -x_interval_size * i - 2, 15)
        }
    }
    figure out why these don't work

f(x)=x^2*1000+1000
graph(f,-2,0)
graph(f,-2*2,2*2*f(0))
    */
   