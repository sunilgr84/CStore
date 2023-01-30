import { Component, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as _ from 'lodash';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
/**
 * Helper interface for listbox items
 */
export interface IListBoxItem {
  value: string;
  text: string;
}
/**
* Helper interface to emit event when
* items are moved between boxes
*/
export interface IItemsMovedEvent {
  available: Array<{}>;
  selected: Array<{}>;
  movedItems: Array<{}>;
  from: 'selected' | 'available';
  to: 'selected' | 'available';
}

@Component({
    selector: 'app-dual-list-box',
    templateUrl: 'dual-list-box.component.html',
    styleUrls: ['dual-list-box.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DualListBoxComponent),
        multi: true
    }]
})
export class DualListBoxComponent implements OnInit, ControlValueAccessor {

    // array of items to display in left box
    @Input() set data(items: Array<{}>) {
        this.availableItems = [...(items || []).map((item: {}) => ({
            value: item[this.valueField].toString(),
            text: item[this.textField]
        }))].reverse();
        console.table(this.availableItems);
    }
    // input to set search term for available list box from the outside
    @Input() set availableSearch(searchTerm: string) {
        this.searchTermAvailable = searchTerm;
        this.availableSearchInputControl.setValue(searchTerm);
    }
    // input to set search term for selected list box from the outside
    @Input() set selectedSearch(searchTerm: string) {
        this.searchTermSelected = searchTerm;
        this.selectedSearchInputControl.setValue(searchTerm);
    }
    // field to use for value of option
    @Input() valueField = 'id';
    // field to use for displaying option text
    @Input() textField = 'name';
    // text to display as title above component
    @Input() title: string;
    // time to debounce search output in ms
    @Input() debounceTime = 500;
    // show/hide button to move all items between boxes
    @Input() moveAllButton = true;
    // text displayed over the available items list box
    @Input() availableText = 'Available items';
    // text displayed over the selected items list box
    @Input() selectedText = 'Selected items';
    // set placeholder text in available items list box
    @Input() availableFilterPlaceholder = 'Filter...' + this.availableText;
    // set placeholder text in selected items list box
    @Input() selectedFilterPlaceholder = 'Filter...' + this.selectedText;

    // event called when item or items from available items(left box) is selected
    @Output() availableItemSelected: EventEmitter<{} | Array<{}>> = new EventEmitter<{} | Array<{}>>();
    // event called when item or items from selected items(right box) is selected
    @Output() selectedItemsSelected: EventEmitter<{} | Array<{}>> = new EventEmitter<{} | Array<{}>>();
    // event called when items are moved between boxes, returns state of both boxes and item moved
    @Output() itemsMoved: EventEmitter<IItemsMovedEvent> = new EventEmitter<IItemsMovedEvent>();

    // private variables to manage class
    searchTermAvailable = '';
    searchTermSelected = '';
    availableItems: Array<IListBoxItem> = [];
    selectedItems: Array<IListBoxItem> = [];
    listBoxForm: FormGroup;
    availableListBoxControl: FormControl = new FormControl();
    selectedListBoxControl: FormControl = new FormControl();
    availableSearchInputControl: FormControl = new FormControl();
    selectedSearchInputControl: FormControl = new FormControl();

    // control value accessors
    _onChange = (__: any) => { };
    _onTouched = () => { };

    constructor(public fb: FormBuilder) {

        this.listBoxForm = this.fb.group({
            availableListBox: this.availableListBoxControl,
            selectedListBox: this.selectedListBoxControl,
            availableSearchInput: this.availableSearchInputControl,
            selectedSearchInput: this.selectedSearchInputControl
        });
    }

    ngOnInit(): void {

        this.availableListBoxControl
            .valueChanges
            .subscribe((items: Array<{}>) => this.availableItemSelected.emit(items));
        this.selectedListBoxControl
            .valueChanges
            .subscribe((items: Array<{}>) => this.selectedItemsSelected.emit(items));
        this.availableSearchInputControl
            .valueChanges.pipe(
              debounceTime(400),
              distinctUntilChanged())
            .subscribe((search: string) => this.searchTermAvailable = search);
        this.selectedSearchInputControl
            .valueChanges.pipe(
              debounceTime(400),
              distinctUntilChanged())
            .subscribe((search: string) => this.searchTermSelected = search);
    }

    /**
     * Move all items from available to selected
     */
    moveAllItemsToSelected(): void {

        if (!this.availableItems.length) {
            return;
        }
        this.selectedItems = [...this.selectedItems, ...this.availableItems];
        this.availableItems = [];
        this.itemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.availableListBoxControl.value,
            from: 'available',
            to: 'selected'
        });
        this.availableListBoxControl.setValue([]);
        this.writeValue(this.getValues());
    }

    /**
     * Move all items from selected to available
     */
    moveAllItemsToAvailable(): void {

        if (!this.selectedItems.length) {
            return;
        }
        this.availableItems = [...this.availableItems, ...this.selectedItems];
        this.selectedItems = [];
        this.itemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.selectedListBoxControl.value,
            from: 'selected',
            to: 'available'
        });
        this.selectedListBoxControl.setValue([]);
        this.writeValue([]);
    }

    /**
     * Move marked items from available items to selected items
     */
    moveMarkedAvailableItemsToSelected(): void {

        // first move items to selected
        this.selectedItems = [...this.selectedItems, ... _.intersectionWith(this.availableItems, this.availableListBoxControl.value,
                (item: IListBoxItem, value: string) => item.value === value)];
        // now filter available items to not include marked values
        this.availableItems = [... _.differenceWith(this.availableItems, this.availableListBoxControl.value,
            (item: IListBoxItem, value: string) => item.value === value)];
        // clear marked available items and emit event
        this.itemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.availableListBoxControl.value,
            from: 'available',
            to: 'selected'
        });
        this.availableListBoxControl.setValue([]);
        this.availableSearchInputControl.setValue('');
        this.writeValue(this.getValues());
    }

    /**
     * Move marked items from selected items to available items
     */
    moveMarkedSelectedItemsToAvailable(): void {

        // first move items to available
        this.availableItems = [...this.availableItems,
            ... _.intersectionWith(this.selectedItems, this.selectedListBoxControl.value,
                (item: IListBoxItem, value: string) => item.value === value)];
        // now filter available items to not include marked values
        this.selectedItems = [... _.differenceWith(this.selectedItems, this.selectedListBoxControl.value,
            (item: IListBoxItem, value: string) => item.value === value)];
        // clear marked available items and emit event
        this.itemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: this.selectedListBoxControl.value,
            from: 'selected',
            to: 'available'
        });
        this.selectedListBoxControl.setValue([]);
        this.selectedSearchInputControl.setValue('');
        this.writeValue(this.getValues());
    }

    /**
     * Move single item from available to selected
     */
    moveAvailableItemToSelected(item: IListBoxItem): void {

        this.availableItems = this.availableItems.filter((listItem: IListBoxItem) => listItem.value !== item.value);
        this.selectedItems = [...this.selectedItems, item];
        this.itemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: [item.value],
            from: 'available',
            to: 'selected'
        });
        this.availableSearchInputControl.setValue('');
        this.availableListBoxControl.setValue([]);
        this.writeValue(this.getValues());
    }

    /**
     * Move single item from selected to available
     */
    moveSelectedItemToAvailable(item: IListBoxItem): void {

        this.selectedItems = this.selectedItems.filter((listItem: IListBoxItem) => listItem.value !== item.value);
        this.availableItems = [...this.availableItems, item];
        this.itemsMoved.emit({
            available: this.availableItems,
            selected: this.selectedItems,
            movedItems: [item.value],
            from: 'selected',
            to: 'available'
        });
        this.selectedSearchInputControl.setValue('');
        this.selectedListBoxControl.setValue([]);
        this.writeValue(this.getValues());
    }

    /**
     * Function to pass to ngFor to improve performance, tracks items
     * by the value field
     */
    trackByValue(index: number, item: {}): string {
        return item[this.valueField];
    }

    /* Methods from ControlValueAccessor interface, required for ngModel and formControlName - begin */
    writeValue(value: any): void {
        if (this.selectedItems && value && value.length > 0) {
            this.selectedItems = [...this.selectedItems,
                ... _.intersectionWith(this.availableItems, value, (item: IListBoxItem, val: string) => item.value === val)];
            this.availableItems = [... _.differenceWith(this.availableItems, value,
                (item: IListBoxItem, val: string) => item.value === val)];
        }
        this._onChange(value);
    }

    registerOnChange(fn: (_: any) => {}): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => {}): void {
        this._onTouched = fn;
    }
    /* Methods from ControlValueAccessor interface, required for ngModel and formControlName - end */

    /**
     * Utility method to get values from
     * selected items
     */
    private getValues(): string[] {
        return (this.selectedItems || []).map((item: IListBoxItem) => item.value);
    }
}
