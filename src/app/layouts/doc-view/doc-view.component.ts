import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { CredentialService } from 'src/app/services/credential/credential.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { TelemetryService } from 'src/app/services/telemetry/telemetry.service';
import { IImpressionEventInput, IInteractEventInput } from 'src/app/services/telemetry/telemetry.interface';
import { AuthConfigService } from 'src/app/authentication/auth-config.service';
import { DomSanitizer } from '@angular/platform-browser';
// import { jsPDF } from 'jspdf';
// import html2canvas from 'html2canvas';
import { UtilService } from 'src/app/services/util/util.service';

const RENDER_CREDENTIAL_FORMAT: string = 'PDF'; //or PDF HTML

@Component({
    selector: 'app-doc-view',
    templateUrl: './doc-view.component.html',
    styleUrls: ['./doc-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DocViewComponent implements OnInit, OnDestroy {
    baseUrl: string;
    docUrl: string;
    extension: string;
    document = [];
    isLoading: boolean = true;
    docName: any;
    docDetails: any;
    credential: any;
    schemaId: string;
    templateId: string;
    isMyAccountPage = false;
    public unsubscribe$ = new Subject<void>();
    private readonly canGoBack: boolean;
    blob: Blob;
    canShareFile = !!navigator.share;
    credentialHTML: any;

    constructor(
        public readonly generalService: GeneralService,
        private readonly router: Router,
        private readonly http: HttpClient,
        private readonly location: Location,
        private readonly credentialService: CredentialService,
        private readonly toastMessage: ToastMessageService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly telemetryService: TelemetryService,
        private readonly authService: AuthService,
        private readonly authConfigService: AuthConfigService,
        private readonly sanitizer: DomSanitizer,
        private readonly utilService: UtilService
    ) {
        this.baseUrl = authConfigService.config.bffUrl;
        const navigation = this.router.getCurrentNavigation();
        this.credential = navigation.extras.state;
        this.canGoBack = !!(this.router.getCurrentNavigation()?.previousNavigation);

        // check if current route is my-account
        const activeRouteUrl = this.activatedRoute.snapshot.url[0].path;
        console.log("activeRouteUrl", activeRouteUrl);


        if (!this.credential && !activeRouteUrl.includes('my-account')) {
            if (this.canGoBack) {
                this.location.back();
            } else {
                this.router.navigate(['/dashboard/issued-credential']);
            }
        }
    }

    ngOnInit(): void {
        this.isLoading = true;
        if (this.credential) {
            this.loadCredential();
        } else {
            this.isMyAccountPage = true;
            this.credentialService.getAllCredentials('teacher').pipe(takeUntil(this.unsubscribe$))
                .subscribe((res) => {
                    this.credential = res[0];
                    this.loadCredential();
                }, (error: any) => {
                    console.error(error);
                    this.toastMessage.error("", this.generalService.translateString('SOMETHING_WENT_WRONG'));
                    const err = error?.error;
                    if (!err?.success && err?.status === 'cred_search_api_failed' && err?.result?.error?.status === 404) {
                        // reissue credential for Teacher
                        this.credentialService.issueCredential().pipe(
                            concatMap(_ => this.credentialService.getAllCredentials('teacher'))
                        ).subscribe((result: any) => {
                            this.isLoading = false;
                            this.credential = result[0];
                            this.loadCredential();
                        }, error => {
                            this.isLoading = false;
                        });
                    } else {
                        this.isLoading = false;
                    }
                });
        }
    }

    loadCredential() {
        if (this.credential?.credential_schema) {
            this.schemaId = this.credential.schemaId;
            this.getTemplate(this.schemaId).pipe(takeUntil(this.unsubscribe$))
                .subscribe((res) => {
                    this.templateId = res?.id;
                    const credential_schema = this.credential.credential_schema;
                    delete this.credential.credential_schema;
                    delete this.credential.schemaId;
                    const request = {
                        credential: this.credential,
                        schema: credential_schema,
                        template: res?.template,
                        output: "HTML"
                    }

                    if (RENDER_CREDENTIAL_FORMAT === 'HTML') {
                        this.getCredentialHTML(request);
                    } else {
                        this.getCredentialPDF(request);
                    }
                }, (error: any) => {
                    this.isLoading = false;
                    console.error("Something went wrong while fetching template!", error);
                    this.toastMessage.error("", this.generalService.translateString('SOMETHING_WENT_WRONG'));
                });
        } else {
            this.isLoading = false;
            console.error("credential_schema is not present");
            this.toastMessage.error("", this.generalService.translateString('SOMETHING_WENT_WRONG'));
        }
    }

    getTemplate(id: string): Observable<any> {
        return this.generalService.getData(`${this.baseUrl}/v1/credentials/rendertemplateschema/${id}`, true).pipe(
            map((res: any) => {
                if (res.result.length > 1) {
                    const selectedLangKey = localStorage.getItem('setLanguage');
                    const certExpireTime = new Date(this.credential.expirationDate).getTime();
                    const currentDateTime = new Date().getTime();
                    const isExpired = certExpireTime < currentDateTime;

                    const type = isExpired ? `inactive-${selectedLangKey}` : `active-${selectedLangKey}`;
                    const template = res.result.find((item: any) => item.type === type);

                    if (template) {
                        return template;
                    } else {
                        const genericTemplate = res.result.find((item: any) => item.type === 'Handlebar');
                        if (genericTemplate) {
                            return genericTemplate;
                        } else {
                            return res.result[0];
                        }
                    }
                } else if (res.result.length === 1) {
                    return res.result[0];
                }
                throwError('Template not attached to schema');
            })
        )
    }

    getCredentialHTML(request: any) {
        this.http.post(`${this.baseUrl}/v1/credentials/renderhtml`, request).pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: any) => {
                this.credentialHTML = this.sanitizer.bypassSecurityTrustHtml(response.result);
                console.log("response", response);
                this.extension = 'html';
                this.isLoading = false;
            });
    }

    getCredentialPDF(request: any) {
        let headerOptions = new HttpHeaders({
            'Accept': 'application/pdf'
        });
        let requestOptions = { headers: headerOptions, responseType: 'blob' as 'json' };
        this.http.post(`${this.baseUrl}/v1/credentials/render`, request, requestOptions).pipe(map((data: any) => {
            this.blob = new Blob([data], {
                type: 'application/pdf' // must match the Accept type
            });
            this.docUrl = window.URL.createObjectURL(this.blob);
            console.log("data", data);
        }), takeUntil(this.unsubscribe$)).subscribe((result: any) => {
            setTimeout(() => {
                this.isLoading = false;
            }, 100);
            this.extension = 'pdf';
        });
    }

    goBack() {
        window.history.go(-1);
    }

    downloadCertificate() {
        if (this.extension === 'pdf') {
            this.utilService.downloadFileWithBlob(`${this.authService.currentUser?.name}_certificate.pdf`, this.blob);
        } else if (this.extension === 'html') {
            const content = document.getElementById('content-to-download');
            this.utilService.downloadPdfWithContent(content, `${this.authService.currentUser?.name}_certificate.pdf`);
        }
    }

    shareFile() {
        if (this.extension === 'html') {
            const content = document.getElementById('content-to-download');
            this.blob = new Blob([content.innerHTML], { type: 'application/pdf' });
        }
        const pdf = new File([this.blob], "certificate.pdf", { type: "application/pdf" });
        const shareData = {
            title: `${this.authService.currentUser?.name}_certificate`.replace(/\s+/g, '_'),
            files: [pdf]
        };

        if (navigator.share) {
            navigator.share(shareData).then((res: any) => {
                console.log("File shared successfully!");
            }).catch((error: any) => {
                this.toastMessage.error("", this.generalService.translateString('SHARED_OPERATION_FAILED'));
                console.error("Shared operation failed!", error);
            })
        } else {
            console.log("Share not supported");
        }
    }


    downloadCredential() {
        // const content = document.getElementById('content-to-download');
        // if (!content) {
        //     console.error('Element not found!');
        //     return;
        // }
        // html2canvas(content).then((canvas) => {
        //     const pdf = new jsPDF('p', 'mm', 'a4');
        //     const imgData = canvas.toDataURL('image/png');
        //     const imgProps = pdf.getImageProperties(imgData);
        //     const pdfWidth = pdf.internal.pageSize.getWidth();
        //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        //     pdf.save('content.pdf');
        // });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    ngAfterViewInit(): void {
        this.raiseImpressionEvent();
    }

    raiseInteractEvent(id: string, type: string = 'CLICK', subtype?: string) {
        console.log("raiseInteractEvent")
        const telemetryInteract: IInteractEventInput = {
            context: {
                env: this.activatedRoute.snapshot?.data?.telemetry?.env,
                cdata: []
            },
            edata: {
                id,
                type,
                subtype,
                pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
            }
        };
        this.telemetryService.interact(telemetryInteract);
    }

    raiseImpressionEvent() {
        const telemetryImpression: IImpressionEventInput = {
            context: {
                env: this.activatedRoute.snapshot?.data?.telemetry?.env,
                cdata: []
            },
            edata: {
                type: this.activatedRoute.snapshot?.data?.telemetry?.type,
                pageid: this.activatedRoute.snapshot?.data?.telemetry?.pageid,
                uri: this.router.url,
                subtype: this.activatedRoute.snapshot?.data?.telemetry?.subtype,
            }
        };
        this.telemetryService.impression(telemetryImpression);
    }
}
