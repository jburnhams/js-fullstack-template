import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://storage.jonathanburnhams.com/api/session', () => {
    return HttpResponse.json({
      id: "session_123",
      user_id: 1,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      last_used_at: new Date().toISOString(),
      user: {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        profile_picture: null,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      }
    });
  }),
];

export const unauthorizedHandlers = [
    http.get('https://storage.jonathanburnhams.com/api/session', () => {
        return HttpResponse.json({
            error: "UNAUTHORIZED",
            message: "Authentication required",
            login_url: "https://storage.jonathanburnhams.com/auth/login"
        }, { status: 401 });
    })
]
