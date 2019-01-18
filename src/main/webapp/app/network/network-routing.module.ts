import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { NetworkComponent } from 'app/network/network.component';
import { NetworkService } from './network.service';
import { Observable, of } from 'rxjs/index';
import { IGraphyNodeDTO, GraphyNodeDTO, NodeDTO } from 'app/shared/model/node.model';
import { filter, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NetworkResolve implements Resolve<NodeDTO> {
    constructor(private service: NetworkService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<NodeDTO> {
        const id = route.params['id'] ? route.params['id'] : null;
        if (id) {
            return this.service.getNodeProperties(id).pipe(
                filter((response: HttpResponse<IGraphyNodeDTO>) => response.ok),
                map((response: HttpResponse<IGraphyNodeDTO>) => {
                    const rawData: IGraphyNodeDTO = response.body;
                    return NetworkService.getNodeDto(rawData.label, rawData.type, rawData.id);
                })
            );
        } else {
            return of(null);
        }
    }
}

const routes: Routes = [
    {
        path: 'network',
        component: NetworkComponent,
        data: {
            pageTitle: 'network.title'
        }
    },
    {
        path: 'network/:id',
        component: NetworkComponent,
        resolve: {
            originNode: NetworkResolve
        },
        data: {
            pageTitle: 'network.title'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NetworkRoutingModule {}