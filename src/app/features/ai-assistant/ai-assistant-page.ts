import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AiAssistantService, AiResponse } from './ai-assistant.service';
@Component({ selector:'app-ai-assistant-page', standalone:true, imports:[FormsModule], templateUrl:'./ai-assistant-page.html', styleUrl:'./ai-assistant-page.css' })
export class AiAssistantPage {
 private readonly ai = inject(AiAssistantService);
 issueDescription = ''; assetType = ''; brandModel = '';
 readonly loading = signal(false); readonly error = signal(''); readonly response = signal<AiResponse | null>(null);
 submit(): void { const issue=this.issueDescription.trim(); if(!issue) { this.error.set('Describe the issue before asking the assistant.'); return; } this.loading.set(true); this.error.set(''); this.response.set(null); this.ai.askTechnicianAssistant({issueDescription:issue, assetType:this.assetType.trim(), brandModel:this.brandModel.trim()}).pipe(finalize(()=>this.loading.set(false))).subscribe({next:r=>this.response.set(r),error:(error: any)=>this.error.set(error?.error?.message ?? 'The AI assistant could not respond. Check that the backend and AI integration are enabled, then try again.')}); }
 clear(): void { this.issueDescription=''; this.assetType=''; this.brandModel=''; this.error.set(''); this.response.set(null); }
}
