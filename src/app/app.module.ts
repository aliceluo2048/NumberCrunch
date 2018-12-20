import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalculationComponent } from './calculation/calculation.component';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent,
	  CalculationComponent,
  ],
  imports: [
    BrowserModule,
	  FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
