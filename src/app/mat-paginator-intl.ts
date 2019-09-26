import {MatPaginatorIntl} from '@angular/material';
import { TranslateParser, TranslateService } from '@ngx-translate/core';

export class MyMatPaginatorIntl extends MatPaginatorIntl {

    private rangeLabelIntl: string;

    constructor(private translateService: TranslateService, private translateParser: TranslateParser) {
        super();
        this.getTranslations();
        this.translateService.onLangChange.subscribe(() => this.getTranslations()  );
    }

    getTranslations() {
        this.translateService.get([
            'PAGINATOR.ITEMS_PER_PAGE',
            'PAGINATOR.NEXT_PAGE',
            'PAGINATOR.PREVIOUS_PAGE',
            'PAGINATOR.RANGE'
        ])
            .subscribe(translation => {
                this.itemsPerPageLabel = translation['PAGINATOR.ITEMS_PER_PAGE'];
                this.nextPageLabel = translation['PAGINATOR.NEXT_PAGE'];
                this.previousPageLabel = translation['PAGINATOR.PREVIOUS_PAGE'];
                this.rangeLabelIntl = translation['PAGINATOR.RANGE'];
                this.changes.next();
            });
    }

    getRangeLabel = (page, pageSize, length) => {
        length = Math.max(length, 0);
        const startIndex = (page) * pageSize + 1;
        const endIndex = startIndex <= length ?
            Math.min(startIndex + pageSize - 1, length) :
            startIndex + pageSize - 1;
        return this.translateParser.interpolate(this.rangeLabelIntl, { startIndex, endIndex, length });
    }

}
