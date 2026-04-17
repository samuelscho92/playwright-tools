import { test, expect } from '@playwright/test';
import bookingData from '../data/booking.json' with { type: 'json' };

/**
 * REST API test suite — Restful Booker (https://restful-booker.herokuapp.com)
 *
 * Demonstrates Playwright's `request` fixture for pure API testing:
 * authentication, CRUD operations, and response shape validation.
 * Each test is self-contained; no shared mutable state between tests.
 */

const CREDENTIALS = { username: 'admin', password: 'password123' };

test.describe('Restful Booker — REST API', () => {
  test.use({ baseURL: 'https://restful-booker.herokuapp.com' });

  test.beforeEach(() => {
    test.info().annotations.push({ type: 'category', description: 'api' });
  });

  test('GET /ping — health check returns 201', async ({ request }) => {
    test.info().annotations.push({ type: 'description', description: 'Verifies the API is reachable.' });
    const response = await request.get('/ping');
    expect(response.status()).toBe(201);
  });

  test('POST /auth — returns a valid token with correct credentials', async ({ request }) => {
    test.info().annotations.push({ type: 'description', description: 'Validates the auth endpoint returns a session token.' });

    const response = await request.post('/auth', { data: CREDENTIALS });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('POST /auth — rejects invalid credentials', async ({ request }) => {
    test.info().annotations.push({ type: 'description', description: 'Ensures bad credentials do not produce a valid token.' });

    const response = await request.post('/auth', {
      data: { username: 'wrong', password: 'wrong' },
    });
    expect(response.ok()).toBeTruthy(); // API returns 200 with error body
    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('GET /booking — returns an array of booking IDs', async ({ request }) => {
    test.info().annotations.push({ type: 'description', description: 'Verifies the booking list endpoint shape.' });

    const response = await request.get('/booking');
    expect(response.ok()).toBeTruthy();
    const ids = await response.json();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids[0]).toHaveProperty('bookingid');
  });

  test('full CRUD lifecycle — create, read, update, delete a booking', async ({ request }) => {
    test.info().annotations.push({
      type: 'description',
      description: 'End-to-end CRUD flow: auth → create → read → patch → delete → verify 404.',
    });

    // Auth
    const authResponse = await request.post('/auth', { data: CREDENTIALS });
    const { token } = await authResponse.json();

    // Create
    const createResponse = await request.post('/booking', {
      data: bookingData,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(createResponse.status()).toBe(200);
    const { bookingid, booking: created } = await createResponse.json();
    expect(bookingid).toBeTruthy();
    expect(created.firstname).toBe(bookingData.firstname);
    expect(created.lastname).toBe(bookingData.lastname);

    // Read
    const readResponse = await request.get(`/booking/${bookingid}`);
    expect(readResponse.ok()).toBeTruthy();
    const fetched = await readResponse.json();
    expect(fetched.totalprice).toBe(bookingData.totalprice);
    expect(fetched.depositpaid).toBe(bookingData.depositpaid);

    // Partial update
    const patchResponse = await request.patch(`/booking/${bookingid}`, {
      data: { firstname: 'Updated' },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${token}`,
      },
    });
    expect(patchResponse.ok()).toBeTruthy();
    const patched = await patchResponse.json();
    expect(patched.firstname).toBe('Updated');
    expect(patched.lastname).toBe(bookingData.lastname); // unchanged

    // Delete
    const deleteResponse = await request.delete(`/booking/${bookingid}`, {
      headers: { Cookie: `token=${token}` },
    });
    expect(deleteResponse.status()).toBe(201);

    // Verify deleted (should 404)
    const verifyResponse = await request.get(`/booking/${bookingid}`);
    expect(verifyResponse.status()).toBe(404);
  });
});
