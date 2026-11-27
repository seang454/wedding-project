import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimStringsPipe implements PipeTransform {
  transform(values: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && typeof values === 'object' && values !== null) {
      return this.trimObject(values);
    }
    return values;
  }

  private trimObject(obj: Record<string, any>): Record<string, any> {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.trimObject(obj[key]);
      }
    }
    return obj;
  }
}
