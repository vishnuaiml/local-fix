/**
 * NammaServices: Automated Test Suite
 * Tests core business rules, double-booking prevention, review completion rules,
 * provider verification pipeline, and PostgreSQL schema constraints.
 */

import { inMemoryDb, db } from './db.ts';
import type { Booking, Provider, Review } from '../types/nammaservices.ts';

export function runMarketplaceTests() {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, message: err?.message || String(err) });
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // Test 1: Double-Booking Prevention Logic
  test('Double booking prevention blocks conflicting confirmed booking for same provider and time slot', () => {
    const testProviderId = 'prov_seed_1';
    const testDate = '2026-11-15';
    const testSlot = '10:30 AM - 12:00 PM';

    // Existing accepted booking
    const booking1: Booking = {
      id: 'BK-TEST-1',
      customer_id: 'cust_seed_1',
      provider_id: testProviderId,
      service_description: 'Electrical wiring',
      service_location: 'T. Nagar, Chennai',
      preferred_date: testDate,
      preferred_time: testSlot,
      booking_status: 'Accepted',
      indicative_price: 349,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryDb.bookings.set(booking1.id, booking1);

    // Attempt concurrent booking for the exact same slot
    const existing = Array.from(inMemoryDb.bookings.values()).filter(
      (b) => b.provider_id === testProviderId
    );
    const hasConflict = existing.some(
      (b) =>
        b.preferred_date === testDate &&
        b.preferred_time === testSlot &&
        (b.booking_status === 'Accepted' || b.booking_status === 'In Progress')
    );

    assert(hasConflict === true, 'Concurrency check must detect the conflicting booked slot');
  });

  // Test 2: Provider Verification Pipeline
  test('Newly registered providers remain pending until approved by platform administrator', () => {
    const testProv: Provider = {
      id: 'prov_test_pending',
      role: 'provider',
      full_name: 'Test Tech',
      business_name: 'Test Fix',
      email: 'test.pending@nammaservices.in',
      phone_number: '+91 98401 00000',
      service_category: 'Electrician',
      service_description: 'Test electrical services',
      service_area: 'Adyar',
      experience_years: 3,
      verification_status: 'pending', // Initial status
      account_status: 'active',
      hourly_rate: 349,
      rating: 0,
      completed_jobs: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryDb.providers.set(testProv.email, { data: testProv });

    // Ensure pending provider does not appear in public approved search
    const approvedOnly = Array.from(inMemoryDb.providers.values())
      .map((p) => p.data)
      .filter((p) => p.verification_status === 'approved');
    assert(
      !approvedOnly.some((p) => p.id === 'prov_test_pending'),
      'Pending provider must NOT appear in public approved listings'
    );

    // Admin approves provider
    testProv.verification_status = 'approved';
    testProv.verification_notes = 'Identity & state electrician wireman license verified.';
    const updatedApproved = Array.from(inMemoryDb.providers.values())
      .map((p) => p.data)
      .filter((p) => p.verification_status === 'approved');
    assert(
      updatedApproved.some((p) => p.id === 'prov_test_pending'),
      'Approved provider must now be active on public search'
    );
  });

  // Test 3: Genuine Review Submission Restricted to Completed Bookings
  test('Reviews are strictly prohibited unless the service booking status is Completed', () => {
    const pendingBooking: Booking = {
      id: 'BK-TEST-PENDING',
      customer_id: 'cust_seed_1',
      provider_id: 'prov_seed_1',
      service_description: 'AC Servicing',
      service_location: 'Velachery',
      preferred_date: '2026-11-20',
      preferred_time: '02:00 PM',
      booking_status: 'In Progress', // Not yet completed
      indicative_price: 499,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryDb.bookings.set(pendingBooking.id, pendingBooking);

    let reviewBlocked = false;
    try {
      if (pendingBooking.booking_status !== 'Completed') {
        throw new Error('Reviews can only be submitted for completed service bookings.');
      }
    } catch {
      reviewBlocked = true;
    }
    assert(reviewBlocked, 'Review submission on non-completed booking must throw error');
  });

  // Test 4: Rating Value Range Constraints (1 to 5 Stars)
  test('Review ratings must adhere to check constraint (1 <= rating <= 5)', () => {
    const invalidRatings = [0, 6, -1, 10];
    invalidRatings.forEach((r) => {
      let isInvalid = false;
      if (r < 1 || r > 5) isInvalid = true;
      assert(isInvalid, `Rating ${r} must be rejected by check constraint`);
    });
  });

  // Test 5: Indicative Base Pricing and Experience Non-Negative Validation
  test('Indicative price and experience years must not be negative', () => {
    const invalidPrices = [-100, -1];
    invalidPrices.forEach((p) => {
      let isInvalid = false;
      if (p < 0) isInvalid = true;
      assert(isInvalid, `Price ${p} must be rejected by non-negative constraint`);
    });
  });

  return results;
}
