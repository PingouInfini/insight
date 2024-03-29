/**
 * Created by gFolgoas on 31/01/2019.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/internal/operators';
import { SideInterface } from '../../side/side.abstract';
import { MapService } from '../map.service';
import { FigureStyle, getlayerIcon, MapLayer, MapState } from '../../shared/util/map-utils';
import { Subscription } from 'rxjs/index';
import { UUID } from '../../shared/util/insight-util';
import { SideMediatorService } from '../../side/side-mediator.service';

@Component({
    selector: 'ins-dessin',
    templateUrl: './dessin.component.html'
})
export class DessinComponent extends SideInterface implements OnInit, OnDestroy {
    layerList: MapLayer[];
    currentStyle: FigureStyle;
    dessinForm: FormGroup;

    layersSubs: Subscription;

    selectedLayer: MapLayer;

    mapStates: MapState;
    mapStatesSubs: Subscription;

    constructor(protected formBuilder: FormBuilder, protected ms: MapService, protected sms: SideMediatorService) {
        super();
        this.currentStyle = this.ms.dessinStates.getValue();
        this.dessinForm = this.formBuilder.group({
            form: [this.currentStyle.form, Validators.required],
            size: [this.currentStyle.size, Validators.required],
            type: [this.currentStyle.type, Validators.required],
            strokeColor: [this.currentStyle.strokeColor, Validators.required],
            fillColor: [this.currentStyle.fillColor, Validators.required]
        });
        this.dessinForm.valueChanges
            .pipe(
                debounceTime(200),
                distinctUntilChanged()
            )
            .subscribe(value => {
                if (this.dessinForm.valid) {
                    this.currentStyle = new FigureStyle(
                        value['form'],
                        value['size'],
                        value['type'],
                        value['strokeColor'],
                        value['fillColor']
                    );
                    this.ms.dessinStates.next(this.currentStyle);
                }
            });
    }

    ngOnInit() {
        this.layersSubs = this.ms.mapLayers
            .pipe(map((layers: MapLayer[]) => layers.filter(layer => layer.layerType !== 'WMS')))
            .subscribe(layers => {
                this.layerList = layers;
            });
        this.mapStatesSubs = this.ms.mapStates.subscribe((newState: MapState) => {
            this.mapStates = newState;
        });
    }

    ngOnDestroy() {
        if (this.layersSubs) {
            this.layersSubs.unsubscribe();
        }
        if (this.mapStatesSubs) {
            this.mapStatesSubs.unsubscribe();
        }
    }

    sendAction(action: string) {
        this.sms._onNewActionClicked.next(action);
    }

    onFormSelected(form: string) {
        this.f.form.setValue(form);
    }

    zoomToLayer(layerId: string) {
        this.ms.zoomToLayer.next(layerId);
    }

    onSelectedLayerChanged(layer: MapLayer) {
        this.selectedLayer = layer;
    }

    onLayerAction(action: string, targetLayer?: MapLayer) {
        const currentLayerList: MapLayer[] = this.layers();
        currentLayerList.forEach(layer => (layer.layerStatus = 'UPDATE'));
        switch (action) {
            case 'VISIBILITY_CHANGED':
                if (targetLayer) {
                    targetLayer.visible = !targetLayer.visible;
                }
                break;
            case 'ADD_DESSIN_LAYER':
                currentLayerList.push(new MapLayer(UUID(), 'LayerDessin', 'DESSIN', true, 1, false));
                break;
            case 'DESSIN_SELECTION_CHANGED':
                if (targetLayer) {
                    if (targetLayer.layerType !== 'DESSIN') {
                        return;
                    }
                    // Réinitialise la liste à selected = false
                    currentLayerList.filter(layer => layer.layerType === 'DESSIN').forEach(layer => (layer.selected = false));
                    // Sélectionne le bon layer
                    targetLayer.selected = true;
                }
                break;
            case 'REMOVE_DESSIN_LAYER':
                if (targetLayer) {
                    const length = currentLayerList.filter(layer => layer.layerType === 'DESSIN').length;
                    // On empêche la suppression lorsqu'il ne reste que 1 layer
                    if (length === 1) {
                        return;
                    }
                    const isSelected = targetLayer.selected;
                    if (isSelected) {
                        currentLayerList.filter(layer => layer.layerType === 'DESSIN').forEach(layer => (layer.selected = false));
                    }
                    currentLayerList.splice(currentLayerList.indexOf(targetLayer), 1);
                    if (isSelected) {
                        currentLayerList.find(layer => layer.layerType === 'DESSIN').selected = true;
                    }
                }
                break;
            case 'REMOVE_KML_LAYER':
                if (targetLayer) {
                    currentLayerList.splice(currentLayerList.indexOf(targetLayer), 1);
                }
                break;
            case 'MOVE_LAYER_DOWN':
                if (targetLayer) {
                    targetLayer.layerZIndex--;
                }
                break;
            case 'MOVE_LAYER_UP':
                if (targetLayer) {
                    targetLayer.layerZIndex++;
                }
                break;
            default:
                break;
        }
        this.ms.mapLayers.next(currentLayerList);
    }

    getLayerIcon(layerType: string): string {
        return getlayerIcon(layerType);
    }

    get f() {
        return this.dessinForm.controls;
    }

    layers() {
        return this.ms.mapLayers.getValue();
    }
}
