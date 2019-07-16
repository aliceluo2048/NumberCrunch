import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalculationComponent } from './calculation/calculation.component';
import { AppComponent } from './app.component';
import { GraphingComponent } from './graphing/graphing.component';
import { AutofocusDirective } from './autofocus.directive';


@NgModule({
  declarations: [
    AppComponent,
	  CalculationComponent,
	  GraphingComponent,
	  AutofocusDirective,
  ],
  imports: [
    BrowserModule,
	  FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
