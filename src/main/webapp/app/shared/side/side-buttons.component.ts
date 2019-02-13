/**
 * Created by gFolgoas on 28/01/2019.
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'ins-side-buttons',
    templateUrl: './side-buttons.component.html'
})
export class SideButtonsComponent implements OnInit {
    @Input()
    isClosed: boolean;
    @Input()
    _sideElement: string;
    @Input()
    target: string;

    @Output()
    closeEmitter: EventEmitter<boolean> = new EventEmitter();
    @Output()
    showEventThreadEmitter: EventEmitter<string> = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    closePanel(doClose: boolean) {
        this.closeEmitter.emit(doClose);
    }

    showEventThread(element: string) {
        this.showEventThreadEmitter.emit(element);
    }
}
