import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  /**
  * Sets the specified string value in local storage as the 'entity' key.
  * @param {string} entity - the value to set as the 'entity' key in local storage.
  */
  setEntity(entity: string) {
    localStorage.setItem('entity', entity);
  }

}
