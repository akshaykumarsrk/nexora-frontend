import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root' // This means that the service is available application-wide. It is a singleton service, meaning that there will be only one instance of this service in the entire application.
})
export class Theme {

    // A signal is like a small box that stores a value and informs Angular when the value changes.
    // The readonly keyword means that you cannot replace the signal itself from outside:
  private readonly storage = typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null;

  readonly isDark = signal(
    this.storage?.getItem('theme') === 'dark'
  );

  constructor() {
    this.applyTheme();
  }

  toggle(): void {
    this.isDark.update(value => !value); // Change the stored theme state.

    this.storage?.setItem(
      'theme',
      this.isDark() ? 'dark' : 'light'
    );

    this.applyTheme(); // Apply the corresponding CSS class.
  }

//   This method applies the theme to the actual HTML document.
// The private keyword means:
// “This method is used only inside the Theme service.”
  private applyTheme(): void {
    // What is docuement?
    // When your Angular application runs in the browser, the browser creates a big JavaScript object called: document
    // It represents the current HTML page. The browser turns this HTML into a structure called the DOM.
    // What is document.documentElement?
    // It means: Give me the root HTML element. i.e <html>
    // document.documentElement.classList means: Get the <html> element, then get its list of CSS classes.
    // Now classList.toggle(): it receive: classList.toggle(className, force)
    // className is 'dark' here and force is this.Dark() which means Should the class exist or not?
    document.documentElement.classList.toggle(
      'dark',
      this.isDark()
    );
  }

  toggleTheme(): void {

  const html = document.documentElement;

  html.classList.add('theme-switching');

  html.classList.toggle('dark');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      html.classList.remove('theme-switching');
    });
  });
}

}