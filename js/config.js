const CONFIG = {
  CLIENT_ID: '229119775387-478telmb1u91282fs6hd8t5b2i0nbf4q.apps.googleusercontent.com',

  SCOPES: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'profile',
    'email',
  ].join(' '),

  CALENDAR_API: 'https://www.googleapis.com/calendar/v3',

  REFRESH_MS: 10 * 60 * 1000,
};
