import { Component, OnInit } from '@angular/core';



import { VerifyService } from 'vc-verification';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
//  const { createCanvas, loadImage } = require('canvas');
//  const { scanImageData } = require('zbar-angular.wasm');

@Component({
  selector: 'app-verify-certificate',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.scss']
})
export class VerifyCertificateComponent implements OnInit {
  itemData: any;
  constructor(public verifyService: VerifyService) {

  }
  ngOnInit(): void {

    this.itemData =
    {
      "scanner_type": "ZBAR_QRCODE",
      "scanNote": "To verify certificate, simply scan the QR code thats on the document.",
      "verify_another_Certificate": 'Verify another Certificate',
      "cetificate_not_valid": 'This Certificate is not valid',
      "scan_qrcode_again": "Please scan QR code again"
    }

  }

}
