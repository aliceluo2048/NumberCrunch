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

  graphFunction(f) {
    let ctx = (CanvasRenderingContext2D = this.canvasRef.nativeElement.getContext(
      "2d"
    ));

    let grid_size = 25;
    let canvas_width = 600;
    let canvas_height = 500;

    let num_lines_x = canvas_height / grid_size;
    let num_lines_y = canvas_width / grid_size;
    let x_axis_distance_grid = num_lines_x / 2;
    let y_axis_distance_grid = num_lines_y / 2;

    let low_x = -4;
    let high_x = -2;
    let num_x_intervals = Math.abs(high_x - low_x);
    let x_interval_size = canvas_width / num_x_intervals;
    let x_origin =
      (low_x < 0 && high_x <= 0) || (low_x >= 0 && high_x > 0)
        ? 0
        : Math.abs(low_x) * x_interval_size;

    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    ctx.save();

    //sample y points
    let x_samples = [low_x, high_x, 0, f(0), (low_x + high_x) / 2];
    let lower_y_bound = Infinity;
    let upper_y_bound = -Infinity;

    for (let x of x_samples) {
      let new_y_point = f(x);
      if (!isNaN(new_y_point)) {
        lower_y_bound = Math.min(new_y_point, lower_y_bound);
        upper_y_bound = Math.max(new_y_point, upper_y_bound);
      }
    }

    let num_y_intervals = Math.abs(upper_y_bound - lower_y_bound);
    let y_interval_size = canvas_height / num_y_intervals;
    let y_origin = upper_y_bound * y_interval_size;

    //draw x and y axis
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#009900";
    ctx.moveTo(0, y_origin);
    ctx.lineTo(canvas_width, y_origin);
    ctx.stroke();
    ctx.strokeStyle = "#0000ff";
    ctx.moveTo(x_origin, 0);
    ctx.lineTo(x_origin, canvas_height);
    ctx.stroke();

    // Grid lines along x-axis
    for (let i = 0; i <= num_lines_x; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;

      if (i == x_axis_distance_grid) {
        ctx.strokeStyle = "#000000";
      } else {
        ctx.strokeStyle = "#e9e9e9";
      }
      if (i == num_lines_x) {
        ctx.moveTo(0, grid_size * i);
        ctx.lineTo(canvas_width, grid_size * i);
      } else {
        ctx.moveTo(0, grid_size * i + 0.5);
        ctx.lineTo(canvas_width, grid_size * i + 0.5);
      }
      ctx.stroke();
    }
    // Grid lines along Y-axis
    for (let i = 0; i <= num_lines_y; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;

      // If line represents Y-axis draw in different color
      if (i == y_axis_distance_grid) {
        ctx.strokeStyle = "#000000";
      } else {
        ctx.strokeStyle = "#e9e9e9";
      }
      if (i == num_lines_y) {
        ctx.moveTo(grid_size * i, 0);
        ctx.lineTo(grid_size * i, canvas_height);
      } else {
        ctx.moveTo(grid_size * i + 0.5, 0);
        ctx.lineTo(grid_size * i + 0.5, canvas_height);
      }
      ctx.stroke();
    }
    ctx.translate(
      y_axis_distance_grid * grid_size,
      x_axis_distance_grid * grid_size
    );

    let interval = 19;
    let half_width = canvas_width / 2;
    let half_height = canvas_height / 2;
    let new_grid_size = interval > grid_size ? interval : half_width / interval;
    var half_x_lines = half_width / new_grid_size;

    // X axis tick marks
    //for (let i = 1; i < y_axis_distance_grid; i++) {
    for (let i = 1; i < half_x_lines; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(new_grid_size * i + 0.5, -3);
      ctx.lineTo(new_grid_size * i + 0.5, 3);
      ctx.stroke();

      ctx.font = "9px Arial";
      ctx.textAlign = "start";
      if (new_grid_size != interval) {
        ctx.fillText("" + i, new_grid_size * i - 2, 15);
      } else {
        ctx.fillText(
          "" + (interval / half_x_lines) * i,
          new_grid_size * i - 2,
          15
        );
      }
    }
    for (let i = 1; i < half_x_lines; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(-new_grid_size * i + 0.5, -3);
      ctx.lineTo(-new_grid_size * i + 0.5, 3);
      ctx.stroke();

      ctx.font = "9px Arial";
      ctx.textAlign = "end";
      if (new_grid_size != interval) {
        ctx.fillText("-" + i, -new_grid_size * i + 3, 15);
      } else {
        ctx.fillText(
          "-" + (interval / half_x_lines) * i,
          -new_grid_size * i + 3,
          15
        );
      }
    }
    //Y axis tick marks
    let yintercept = Math.abs(f(0));
    var multiple = yintercept != 0 ? yintercept / (half_height / grid_size) : 1;

    for (let i = 1; i < x_axis_distance_grid; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(-3, grid_size * i + 0.5);
      ctx.lineTo(3, grid_size * i + 0.5);
      ctx.stroke();

      ctx.font = "9px Arial";
      ctx.textAlign = "start";
      ctx.fillText("-" + multiple * i, 8, grid_size * i + 3);
    }
    for (let i = 1; i < x_axis_distance_grid; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";

      ctx.moveTo(-3, -grid_size * i + 0.5);
      ctx.lineTo(3, -grid_size * i + 0.5);
      ctx.stroke();

      ctx.font = "9px Arial";
      ctx.textAlign = "start";
      ctx.fillText("" + multiple * i, 8, -grid_size * i + 3);
    }

    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    let left = -interval;
    let right = interval;
    let stepFraction = 0.01;
    let prevX = left;
    let prevY = f(prevX);

    for (let x = left + stepFraction; x <= right; x += stepFraction) {
      let y = f(x);
      ctx.moveTo(prevX * new_grid_size + 0.5, (-prevY * grid_size) / multiple);
      ctx.lineTo(x * new_grid_size + 0.5, (-y * grid_size) / multiple);
      ctx.stroke();
      prevX = x;
      prevY = y;
    }
    ctx.restore();
  }
}
