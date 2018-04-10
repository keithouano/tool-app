import { Component } from '@angular/core';

import { HistoryPage } from '../history/history';
import { ScheduledPage } from '../scheduled/scheduled';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HistoryPage;
  tab2Root = ScheduledPage;

  constructor() {

  }
}