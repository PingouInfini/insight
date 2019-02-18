/**
 * Created by gFolgoas on 31/01/2019.
 */
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { SideInterface } from '../../shared/side/side.abstract';
import { MapService } from '../map.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/internal/operators';
import { IMapDataDTO } from '../../shared/model/map.model';
import { ZoomToFeatureRequest } from '../../shared/util/map-utils';
import { Subscription } from 'rxjs/index';

@Component({
    selector: 'ins-map-search',
    templateUrl: './map-search.component.html'
})
export class MapSearchComponent extends SideInterface implements OnInit, AfterViewInit, OnDestroy {
    currentResult: IMapDataDTO[] = [];
    searchForm: FormControl = new FormControl('');
    pinnedIds: string[];

    pinnedGeoMarkerSubs: Subscription;

    constructor(protected ms: MapService) {
        super();
    }

    ngOnInit() {
        this.searchForm.valueChanges
            .pipe(
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((value: string) => {
                    return this.ms.getGeoMarker(value);
                })
            )
            .subscribe((result: IMapDataDTO[]) => {
                this.currentResult = result;
            });
        this.pinnedGeoMarkerSubs = this.ms.pinnedGeoMarker.subscribe((pinnedIds: string[]) => {
            this.pinnedIds = pinnedIds;
        });
    }

    ngAfterViewInit() {}

    ngOnDestroy() {
        if (this.pinnedGeoMarkerSubs) {
            this.pinnedGeoMarkerSubs.unsubscribe();
        }
    }

    onEnter(event) {
        this.ms.getFeaturesFromGeoMarker(this.currentResult);
    }

    zoomToFeature(featId: string) {
        this.ms.zoomToFeature.next(new ZoomToFeatureRequest('geoMarkerLayer', featId));
    }

    pinnedFeature(featId: string) {
        const currentValue = this.ms.pinnedGeoMarker.getValue();
        const i = currentValue.indexOf(featId);
        if (i !== -1) {
            currentValue.splice(i, 1);
        } else {
            currentValue.push(featId);
        }
        this.ms.pinnedGeoMarker.next(currentValue);
    }
}
