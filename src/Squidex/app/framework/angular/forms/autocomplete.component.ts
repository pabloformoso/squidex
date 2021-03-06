/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { ChangeDetectionStrategy, Component, ContentChild, forwardRef, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';

export interface AutocompleteSource {
    find(query: string): Observable<any[]>;
}

const KEY_ENTER = 13;
const KEY_ESCAPE = 27;
const KEY_UP = 38;
const KEY_DOWN = 40;

export const SQX_AUTOCOMPLETE_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutocompleteComponent), multi: true
};

@Component({
    selector: 'sqx-autocomplete',
    styleUrls: ['./autocomplete.component.scss'],
    templateUrl: './autocomplete.component.html',
    providers: [SQX_AUTOCOMPLETE_CONTROL_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent implements ControlValueAccessor, OnDestroy, OnInit {
    private subscription: Subscription;
    private callChange = (v: any) => { /* NOOP */ };
    private callTouched = () => { /* NOOP */ };

    @Input()
    public source: AutocompleteSource;

    @Input()
    public inputName = 'autocompletion';

    @Input()
    public displayProperty = '';

    @Input()
    public placeholder = '';

    @ContentChild(TemplateRef)
    public itemTemplate: TemplateRef<any>;

    public suggestedItems: any[] = [];
    public suggestedIndex = -1;

    public queryInput = new FormControl();

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    public ngOnInit() {
        this.subscription =
            this.queryInput.valueChanges.pipe(
                    tap(query => {
                        this.callChange(query);
                    }),
                    map(query => <string>query),
                    map(query => query ? query.trim() : query),
                    tap(query => {
                        if (!query) {
                            this.reset();
                        }
                    }),
                    debounceTime(200),
                    distinctUntilChanged(),
                    filter(query => !!query && !!this.source),
                    switchMap(query => this.source.find(query)), catchError(() => of([])))
                .subscribe(items => {
                    this.suggestedIndex = -1;
                    this.suggestedItems = items || [];
                });
    }

    public onKeyDown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case KEY_UP:
                this.up();
                return false;
            case KEY_DOWN:
                this.down();
                return false;
            case KEY_ESCAPE:
                this.resetForm();
                this.reset();
                return false;
            case KEY_ENTER:
                if (this.suggestedItems.length > 0) {
                    this.selectItem();
                    return false;
                }
                break;
        }

        return true;
    }

    public writeValue(obj: any) {
        if (!obj) {
            this.resetForm();
        } else {
            const item = this.suggestedItems.find(i => i === obj);

            if (item) {
                this.queryInput.setValue(obj.title || '');
            }
        }

        this.reset();
    }

    public setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.reset();
            this.queryInput.disable();
        } else {
            this.queryInput.enable();
        }
    }

    public registerOnChange(fn: any) {
        this.callChange = fn;
    }

    public registerOnTouched(fn: any) {
        this.callTouched = fn;
    }

    public blur() {
        this.reset();
        this.callTouched();
    }

    public selectItem(selection: any | null = null) {
        if (!selection) {
            selection = this.suggestedItems[this.suggestedIndex];
        }

        if (!selection && this.suggestedItems.length === 1) {
            selection = this.suggestedItems[0];
        }

        if (selection) {
            try {
                if (this.displayProperty && this.displayProperty.length > 0) {
                    this.queryInput.setValue(selection[this.displayProperty], { emitEvent: false });
                } else {
                    this.queryInput.setValue(selection.toString(), { emitEvent: false });
                }
                this.callChange(selection);
            } finally {
                this.reset();
            }
        }
    }

    public selectIndex(selection: number) {
        if (selection < 0) {
            selection = 0;
        }

        if (selection >= this.suggestedItems.length) {
            selection = this.suggestedItems.length - 1;
        }

        this.suggestedIndex = selection;
    }

    private up() {
        this.selectIndex(this.suggestedIndex - 1);
    }

    private down() {
        this.selectIndex(this.suggestedIndex + 1);
    }

    private resetForm() {
        this.queryInput.setValue('');
    }

    private reset() {
        this.suggestedItems = [];
        this.suggestedIndex = -1;
    }
}