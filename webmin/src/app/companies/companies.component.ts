import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { GeocodingService } from '../../services/google-maps/geocoding.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { CompaniesUi, viewCompany } from '../../services/ui/companies-ui'
import { CompaniesApiService } from '../../services/api/companies-api.service'
import { State } from '../../domain/state';
@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  view: 'map' | 'table' = 'map';

  submitted = false;
  form: FormGroup;
  states: State[];
  countries: Country[];

  constructor(
    private fb: FormBuilder,
    private geocoding: GeocodingService,
    private companiesUi: CompaniesUi,
    private apiCompanies: CompaniesApiService,
    private apiStates: StatesApiService,
    private apiCountries: CountriesApiService,
  ) {

    this.states = [];
    this.countries = [];

    this.form = this.fb.group({
      country: [null, [Validators.required]],
      state: [null, [Validators.required]],
      name: [null, [Validators.required]],
      address: [null, [Validators.required]],
      latitude: [{ value: null, disabled: true }, Validators.required],
      longitude: [{ value: null, disabled: true }, Validators.required],
    });

    this.form.controls.address.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      const data = this.geocoding.search(value);
      console.log(data);
    });

    this.companiesUi
      .subscribeViewEvent()
      .subscribe(view => this.view = view);


    this.apiStates.index().subscribe(states => this.states = states.data);
    this.apiCountries.index().subscribe(countries => {
      this.countries = countries;

      if (this.countries.length === 1) {
        const country = this.countries[0];
        this.form.get('country')?.setValue(country.id);
        this.form.get('country')?.disable();
      }
    });
  }


  ngOnInit(): void {

  }

  save() {

    this.submitted = true;
    if(this.form.invalid){
      return;
    }

  }

  changeView(view: viewCompany) {
    this.companiesUi.changeView(view);
  }

}

import { StatesApiService } from '../../services/api/states-api.service'
import { Country } from '../../domain/country'
import { CountriesApiService } from '../../services/api/countries-api.service'
