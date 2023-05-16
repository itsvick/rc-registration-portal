import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask'
})
export class MaskPipe implements PipeTransform {

  transform(value: string, startIndex: number ,endIndex : number): string { 
      let maskedSection = value.slice(startIndex, endIndex);
      let visibleSection = value.slice(endIndex);
      return maskedSection.replace(/./g, '*') + visibleSection;

  }

}
