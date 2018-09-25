import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { JhiAlertService } from 'ng-jhipster';
import { DomSanitizer } from '@angular/platform-browser';
import {
    EntityMappingInfo,
    IKibanaVisualisationGenerationParameters,
    KibanaDashboardGenerationParameters,
    KibanaVisualisationGenerationParameters
} from './kibana-object.model';
import { VisualisationService } from './visualisation.service';

@Component({
    selector: 'jhi-visualisation-create-dashboard',
    templateUrl: './visualisation-create-dashboard.component.html'
})
export class VisualisationCreateDashboardComponent implements OnInit, OnDestroy {
    dashboardParameters: KibanaDashboardGenerationParameters;
    @Input() mappingInfo: EntityMappingInfo[];
    @Output() dashboardEmitter: EventEmitter<KibanaDashboardGenerationParameters> = new EventEmitter();

    constructor(private jhiAlertService: JhiAlertService, private visuService: VisualisationService, private ds: DomSanitizer) {}

    ngOnInit() {
        const visualisations: KibanaVisualisationGenerationParameters[] = [];
        visualisations.push(new KibanaVisualisationGenerationParameters('Default Title', 'VISU_TABLE', '', '', ''));
        visualisations.push(new KibanaVisualisationGenerationParameters('Default Title', 'VISU_PIE', '', '', ''));
        visualisations.push(new KibanaVisualisationGenerationParameters('Default Title', 'VISU_VERT_BAR', '', '', ''));
        visualisations.push(new KibanaVisualisationGenerationParameters('Default Title', 'VISU_TIMELINE', '', '', ''));
        visualisations.push(new KibanaVisualisationGenerationParameters('Default Title', 'VISU_MAP', '', '', ''));
        this.dashboardParameters = new KibanaDashboardGenerationParameters('', visualisations);
    }

    ngOnDestroy() {}

    getSelectedIndexPattern(id: string): EntityMappingInfo {
        const matchingPattern: EntityMappingInfo[] = this.mappingInfo.filter((mapInfo: EntityMappingInfo) => {
            return mapInfo.indexPatternId === id;
        });
        return matchingPattern.length > 0 ? matchingPattern[0] : null;
    }

    save() {
        this.dashboardParameters.visualisations.forEach((visu: IKibanaVisualisationGenerationParameters) => {
            visu.indexPatternName = this.getSelectedIndexPattern(visu.indexPatternId).indexPatternName;
        });
        this.dashboardEmitter.emit(this.dashboardParameters);
    }

    private onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}