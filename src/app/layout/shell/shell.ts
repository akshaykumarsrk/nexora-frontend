import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar,
    Topbar
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.css'
})
export class ShellComponent {

  // means: sidebarOpen -> "This is a signal that tells me whether the sidebar is open or closed." and signal(false) -> "The initial value of this signal is false, meaning the sidebar is closed."
  readonly sidebarOpen = signal(false);

  // means: "Update the value of sidebarOpen to the opposite of its current value." If it's currently true (open), it becomes false (closed). If it's currently false (closed), it becomes true (open).
  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  // means: "Set the value of sidebarOpen to false, which means the sidebar is closed."
  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

}