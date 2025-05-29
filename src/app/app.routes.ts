import { Routes } from '@angular/router';
import { UnderMaintenanceComponent } from './components/under-maintenance/under-maintenance.component';
import { HomeComponent } from './components/home/home.component';
import { DisplayPageComponent } from './components/display-page/display-page.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { PageBuilderAndTestComponent } from './components/page-builder-and-test/page-builder-and-test.component';
import { FintechComponent } from './components/pages/fintech/fintech.component';
import { HealthcareComponent } from './components/pages/healthcare/healthcare.component';
import { ManufacturingComponent } from './components/pages/manufacturing/manufacturing.component';
import { PublicservicesComponent } from './components/pages/publicservices/publicservices.component';
import { LowcodenocodeComponent } from './components/pages/lowcodenocode/lowcodenocode.component';
import { ProcodeComponent } from './components/pages/procode/procode.component';
import { GenerativeaiComponent } from './components/pages/generativeai/generativeai.component';
import { AiandmlComponent } from './components/pages/aiandml/aiandml.component';
import { CloudnativeComponent } from './components/pages/cloudnative/cloudnative.component';
import { SynapforceComponent } from './components/pages/synapforce/synapforce.component';
import { SynaplexComponent } from './components/pages/synaplex/synaplex.component';
import { SynaplogixComponent } from './components/pages/synaplogix/synaplogix.component';

export const routes: Routes = [
    {path:'', redirectTo:'home', pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path:'fintech', component: FintechComponent},
    {path:'healthcare', component: HealthcareComponent},
    {path:'manufacturing', component: ManufacturingComponent},
    {path:'public-services', component: PublicservicesComponent},
    {path:'low-code', component: LowcodenocodeComponent},
    {path:'pro-code', component: ProcodeComponent},
    {path:'generative-ai', component: GenerativeaiComponent},
    {path:'ai-ml', component: AiandmlComponent},
    {path:'cloud-native', component: CloudnativeComponent},
    {path:'synapforce', component: SynapforceComponent},
    {path:'synaplex', component: SynaplexComponent},
    {path:'synaplogix', component: SynaplogixComponent},
    {path:'under-maintenance', component:UnderMaintenanceComponent},
    {path: 'error-page', component: ErrorPageComponent},
    {path: 'build', component: PageBuilderAndTestComponent}, // for developing new pages, HTML and CSS. Not for Production. Excluded in Roboto.txt, not added to sitemap.xml and set seo meta to noindex and no follow.
    { path: ':slug', component: DisplayPageComponent},
    { path: '**', component: ErrorPageComponent, data: { statusCode: 404 } } // Catch-all for unknown URLs like Multi-segment URLs (More than one /) website.com/random/123/page
    
];
