import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Theme } from '../../../core/services/theme';
@Component({ selector: 'app-settings-home', standalone: true, templateUrl: './settings-home.html', styleUrl: './settings-home.css' })
export class SettingsHome { readonly theme = inject(Theme); private readonly router = inject(Router); open(path: string): void { void this.router.navigate([path]); } }
