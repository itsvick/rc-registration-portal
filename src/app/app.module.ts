import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbAccordionModule, NgbPaginationModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// formly
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormlyModule } from '@ngx-formly/core';
import { VerifyModule } from 'vc-verification';
import { ArrayTypeComponent } from '../app/forms/types/array.type';
import { AutocompleteTypeComponent } from '../app/forms/types/autocomplete.type';
import { FormlyColorInput } from '../app/forms/types/color.type';
import { MultiSchemaTypeComponent } from '../app/forms/types/multischema.type';
import { NullTypeComponent } from '../app/forms/types/null.type';
import { ObjectTypeComponent } from '../app/forms/types/object.type';
import { initLang } from './multilingual.init';
import { initializeKeycloak } from './utility/app.init';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

//Local imports
import { QuarModule } from '@altack/quar';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { Bootstrap4FrameworkModule } from 'angular6-json-schema-form';
import { SearchComponent } from '../app/discovery/search/search.component';
import { ModalRouterAddLinkDirective, ModalRouterEditLinkDirective } from '../app/layouts/modal/modal.directive';
import { AppConfig } from './app.config';
import { AuthConfigService } from './authentication/auth-config.service';
import { LogoutComponent } from './authentication/logout/logout.component';
import { AddDocumentComponent } from './documents/add-document/add-document.component';
import { BrowseDocumentsComponent } from './documents/browse-documents/browse-documents.component';
import { DocumentsComponent } from './documents/documents.component';
import { ScanDocumentComponent } from './documents/scan-document/scan-document.component';
import { ScanQrCodeComponent } from './documents/scan-qr-code/scan-qr-code.component';
import { FormsComponent } from './forms/forms.component';
import { FileValueAccessor } from './forms/types/file-value-accessor';
import { FormlyFieldFile } from './forms/types/file.type';
import { FormlyFieldNgSelect } from './forms/types/multiselect.type';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { InstallComponent } from './install/install.component';
import { DocViewComponent } from './layouts/doc-view/doc-view.component';
import { LayoutsComponent } from './layouts/layouts.component';
import { AddPanelComponent } from './layouts/modal/panels/add-panel/add-panel.component';
import { EditPanelComponent } from './layouts/modal/panels/edit-panel/edit-panel.component';
import { PanelsComponent } from './layouts/modal/panels/panels.component';
import { AttestationComponent } from './tables/attestation/attestation.component';
import { TablesComponent } from './tables/tables.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { VerifyCertificateComponent } from './issure/verify-certificate/verify-certificate.component';

function initConfig(config: AppConfig) {
  return () => config.load()
}

let baseConfig = require('../assets/config/config.json')

let configData = {
  baseUrl: baseConfig['baseUrl']
}

import { ServiceWorkerModule } from '@angular/service-worker';
import ISO6391 from 'iso-639-1';
import { environment } from '../environments/environment';

import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
// import { FaqComponent } from './custom-components/faq/faq.component';
import { VerifyIndentityCode } from './forms/types/verify-identity-no.type';
import { GraphDashboardComponent } from './graph-dashboard/graph-dashboard.component';
import { AddCertificateComponent } from './issure/add-certificate/add-certificate.component';
import { AddRecordsComponent } from './issure/add-records/add-records.component';
import { DashboardComponent } from './issure/dashboard/dashboard.component';
import { GetRecordsComponent } from './issure/get-records/get-records.component';
import { PreviewHtmlComponent } from './issure/preview-html/preview-html.component';
import { initTheme } from './theme.config';
// import { VerifyComponent } from './issure/verify/verify.component' 
import { AdvanceEditorComponent } from './issure/advance-editor/advance-editor.component';
// import { CreateCertificateComponent } from './create-certificate/create-certificate.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgxTextEditorModule } from 'ngx-text-editor';
import { VerifyComponent } from './issure/verify/verify.component';

//import * as configData from '../assets/config/config.json';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AadhaarKycComponent } from './authentication/aadhaar-kyc/aadhaar-kyc.component';
import { BulkIssueCredentialsComponent } from './bulk-issue-credentials/bulk-issue-credentials.component';
import { UdiseLinkComponent } from './custom/udise-link/udise-link.component';
import { formlyTypeConfig } from './formly.config';
import { IssuedCredentialsComponent } from './issued-credentials/issued-credentials.component';
import { BulkRecordsComponent } from './issure/bulk-records/bulk-records.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { MaskPipe } from './mask.pipe';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { KeysPipe } from './utility/pipes/keys.pipe';
import { DatepickerTypeComponent } from './forms/types/datepicker-type.component';

@NgModule({
  declarations: [
    AppComponent,
    FormsComponent,
    SearchComponent,
    ArrayTypeComponent,
    ObjectTypeComponent,
    MultiSchemaTypeComponent,
    NullTypeComponent,
    LayoutsComponent,
    ModalRouterEditLinkDirective,
    ModalRouterAddLinkDirective,
    PanelsComponent,
    EditPanelComponent,
    AddPanelComponent,
    TablesComponent,
    AutocompleteTypeComponent,
    VerifyIndentityCode,
    FormlyColorInput,
    HeaderComponent,
    AttestationComponent,
    FileValueAccessor,
    FormlyFieldFile,
    DocViewComponent,
    FormlyFieldNgSelect,
    InstallComponent,
    HomeComponent,
    LogoutComponent,
    DocumentsComponent,
    AddDocumentComponent,
    ScanDocumentComponent,
    ScanQrCodeComponent,
    BrowseDocumentsComponent,
    DashboardComponent,
    AddCertificateComponent,
    GetRecordsComponent,
    AddRecordsComponent,
    GraphDashboardComponent,
    PreviewHtmlComponent,
    VerifyComponent,
    AdvanceEditorComponent,
    BulkRecordsComponent,
    VerifyCertificateComponent,
    MaskPipe,
    OnboardingComponent,
    UdiseLinkComponent,
    SidebarComponent,
    MainDashboardComponent,
    IssuedCredentialsComponent,
    BulkIssueCredentialsComponent,
    KeysPipe,
    AadhaarKycComponent,
    DatepickerTypeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbProgressbarModule, 
    NgbAccordionModule, 
    NgbPaginationModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    KeycloakAngularModule,
    Bootstrap4FrameworkModule,
    AngularMultiSelectModule,
    NgSelectModule,
    VerifyModule.forChild(configData),
    ZXingScannerModule,
    HttpClientModule,
    TranslateModule.forRoot(),

    // WebcamModule,
    ColorPickerModule,
    QuarModule,
    NgxExtendedPdfViewerModule,
    FormlyModule.forRoot(formlyTypeConfig),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-full-width',
      preventDuplicates: true,
    }),
    NgxPaginationModule,
    NgJsonEditorModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgxTextEditorModule,
    FormlyBootstrapModule
  ],
  exports: [TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents: [],
  bootstrap: [AppComponent],
  providers: [
    AppConfig,
    { provide: APP_INITIALIZER, useFactory: initConfig, deps: [AppConfig], multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, AuthConfigService],
    },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'always' } },
    {
      provide: APP_INITIALIZER,
      useFactory: initLang,
      deps: [HttpClient, TranslateService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initTheme,
      deps: [AuthConfigService],
      multi: true
    }]
})


export class AppModule {
  languages;
  constructor(translate: TranslateService, authConfig: AuthConfigService) {

    authConfig.getConfig().subscribe((config) => {
      this.languages = config.languages;
      var installed_languages = [];

      for (let i = 0; i < this.languages.length; i++) {
        installed_languages.push({
          "code": this.languages[i],
          "name": ISO6391.getNativeName(this.languages[i])
        });
      }

      localStorage.setItem('languages', JSON.stringify(installed_languages));
      translate.addLangs(this.languages);

      if (localStorage.getItem('setLanguage') && this.languages.includes(localStorage.getItem('setLanguage'))) {
        translate.use(localStorage.getItem('setLanguage'));

      } else {
        const browserLang = translate.getBrowserLang();
        let lang = this.languages.includes(browserLang) ? browserLang : 'en';
        translate.use(lang);
        localStorage.setItem('setLanguage', lang);
      }
    });

  }
}

