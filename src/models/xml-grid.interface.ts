export interface ScheduleEvent {
  channel: {
    _text: string;
  },
  scheduleDate: {
    _text: string;
  },
  ScheduleItens: {
    ScheduleItem: {
      startTime: {
        _text: string;
      },
      eventProfileId: {
        _text: string;
      },
      titleName: {
        _text: string;
      },
      titleDuration: {
        _text: string;
      },
      director: {
        _text?: string | null;
      },
      cast1: {
        _text?: string | null;
      },
      cast2: {
        _text?: string | null;
      },
      titleSynopsis: {
        _text?: string | null;
      },
      titleSeason: {
        _text?: string | null;
      }
    }
  }
}

export interface XmlGrid {
  _declaration: {[key: string]: any},
  ListingExport: {
    ListingExportItem: ScheduleEvent[]
  }
}