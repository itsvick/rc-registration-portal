import { Pipe, PipeTransform } from '@angular/core';
import { UtilService } from 'src/app/services/util/util.service';

@Pipe({
  name: 'ignorecase'
})
export class ignoreCasePipe implements PipeTransform {

  constructor(
    private readonly utilService: UtilService
  ) { }

  transform(value: string, ...args: unknown[]): unknown {
    return this.utilService.variableNameToReadableString(value);
  }
}
