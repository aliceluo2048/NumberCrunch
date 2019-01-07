import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-graphing',
  templateUrl: './graphing.component.html',
  styleUrls: ['./graphing.component.css']
})
export class GraphingComponent implements OnInit {
  @ViewChild('myCanvas') canvasRef: ElementRef

  constructor() { }
  ngOnInit() { 
    let grid_size = 25
    let canvas_width = 600
    let canvas_height = 500

    let num_lines_x = canvas_height/grid_size
    let num_lines_y = canvas_width/grid_size
    let x_axis_distance_grid = num_lines_x/2 
    let y_axis_distance_grid = num_lines_y/2 
    
    let ctx: CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext('2d')
    
    // Grid lines along x-axis 
    for(let i = 0; i<= num_lines_x; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      
      if(i == x_axis_distance_grid) 
          ctx.strokeStyle = "#000000";
      else
          ctx.strokeStyle = "#e9e9e9";
      
      if(i == num_lines_x) {
          ctx.moveTo(0, grid_size*i);
          ctx.lineTo(canvas_width, grid_size*i);
      }
      else {
          ctx.moveTo(0, grid_size*i+0.5);
          ctx.lineTo(canvas_width, grid_size*i+0.5);
      }
      ctx.stroke();
    }
    // Grid lines along Y-axis
    for(let i = 0; i<=num_lines_y; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      
      // If line represents Y-axis draw in different color
      if(i == y_axis_distance_grid) 
          ctx.strokeStyle = "#000000";
      else
          ctx.strokeStyle = "#e9e9e9";
      
      if(i == num_lines_y) {
          ctx.moveTo(grid_size*i, 0);
          ctx.lineTo(grid_size*i, canvas_height);
      }
      else {
          ctx.moveTo(grid_size*i+0.5, 0);
          ctx.lineTo(grid_size*i+0.5, canvas_height);
      }
      ctx.stroke();
    } 
    ctx.translate(y_axis_distance_grid * grid_size, x_axis_distance_grid * grid_size)
 
    // X axis tick marks 
    for (let i = 1; i < y_axis_distance_grid; i++) {
      ctx.beginPath()
      ctx.lineWidth = 1 
      ctx.strokeStyle = "#000000"
      
      ctx.moveTo(grid_size*i + 0.5, -3)
      ctx.lineTo(grid_size*i + 0.5, 3)
      ctx.stroke()
      
      ctx.font = '9px Arial'
      ctx.textAlign = 'start'
      ctx.fillText("" + i, grid_size*i -2, 15)
    }
    for (let i = 1; i < y_axis_distance_grid; i++) {
      ctx.beginPath()
      ctx.lineWidth = 1 
      ctx.strokeStyle = "#000000"
      
      ctx.moveTo(-grid_size*i + 0.5, -3)
      ctx.lineTo(-grid_size*i + 0.5, 3)
      ctx.stroke()
      
      ctx.font = '9px Arial'
      ctx.textAlign = 'end'
      ctx.fillText("-" + i, -grid_size*i + 3, 15)
    }
    //Y axis tick marks 
    for (let i = 1; i < x_axis_distance_grid; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(-3, grid_size * i + 0.5)
      ctx.lineTo(3, grid_size * i + 0.5)
      ctx.stroke()

      ctx.font = '9px Arial'
      ctx.textAlign = 'start'
      ctx.fillText("-" + i, 8, grid_size*i + 3)
    }
    for (let i = 1; i < x_axis_distance_grid; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(-3, -grid_size * i + 0.5)
      ctx.lineTo(3, -grid_size * i + 0.5)
      ctx.stroke()

      ctx.font = '9px Arial'
      ctx.textAlign = 'start'
      ctx.fillText("" + i, 8, -grid_size*i + 3)
    }
 
    ctx.beginPath()

    let f = function(x) {
      return (x + 9) * Math.abs(x + 6) * (x + 3) * Math.abs(x - 3) * (x - 6) / (6 ** 5) * 4
    }
    let left = -12
    let right = 12
    let stepFraction = 0.01
    let prevX = left;
    let prevY = f(prevX)
    for (let x = left + stepFraction; x <= right; x += stepFraction) {
      let y = f(x)
      ctx.moveTo(prevX * grid_size, -prevY * grid_size)
      ctx.lineTo(x * grid_size, -y * grid_size)
      ctx.stroke()
      prevX = x
      prevY = y
    }
  }
}
