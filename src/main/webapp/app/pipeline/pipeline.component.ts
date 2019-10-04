import { Component, OnDestroy, OnInit } from '@angular/core';
import { PipelineService } from 'app/pipeline/pipeline.service';
import { Subscription } from 'rxjs';
import { ILoadedFormFile, IProcessedFormFile } from 'app/shared/model/pipeline.model';
import { HttpResponse } from '@angular/common/http';
import { readFile } from 'app/shared/util/insight-util';
import { JhiAlertService } from 'ng-jhipster';

@Component({
    selector: 'ins-pipeline',
    templateUrl: './pipeline.component.html',
    styleUrls: ['pipeline.component.scss']
})
export class PipelineComponent implements OnInit, OnDestroy {
    loadedFilesSubs: Subscription;

    constructor(private _ps: PipelineService, private _jas: JhiAlertService) {}

    ngOnInit() {
        this.loadedFilesSubs = this._ps.loadedFiles.subscribe((files: ILoadedFormFile[]) => {
            files
                .filter(f => !f.fileContent && !f.isRead)
                .map(f => {
                    f.isRead = true;
                    return f;
                })
                .forEach(f => {
                    readFile<any>(f.file).then(
                        content => {
                            f.fileContent = content;
                        },
                        error => {
                            this.onError(`Failed to read file content: ${f.fileName}`);
                        }
                    );
                });
        });
    }

    ngOnDestroy(): void {
        this.loadedFilesSubs.unsubscribe();
    }

    sendForms() {
        this._ps.loadedFiles
            .getValue()
            .filter(f => !f.isSended && f.fileContent)
            .forEach(f => {
                this.sendForm(f);
            });
    }

    clearLoadedForms() {
        this._ps.loadedFiles.next([]);
    }

    sendForm(file: ILoadedFormFile) {
        file.isSended = true;
        this._ps.sendForm(file.fileContent).subscribe(
            (res: HttpResponse<string>) => {
                const externalBioId = res.body;
                const processedFiles = this.getProcessedFiles().concat([{ externalBioId }]);
                this._ps.processedFiles.next(processedFiles);

                this._ps.loadedFiles.next(this.getLoadedFiles().filter(f => f.id === file.id));
            },
            error => {
                this.onError(`Failed to post file content: ${file.fileName}`);
            }
        );
    }

    getProcessedFiles(): IProcessedFormFile[] {
        return this._ps.processedFiles.getValue();
    }

    getLoadedFiles(): ILoadedFormFile[] {
        return this._ps.loadedFiles.getValue();
    }

    protected onError(errorMessage: string) {
        this._jas.error(errorMessage, null, null);
    }
}