I will complete the subscription management system and enhance the dashboard with a modern, feminine aesthetic as requested.

### Phase 1: Subscription Automation & Visibility
- Update the Dashboard to automatically trigger the expiration check when a user logs in.
- Add an elegant notification banner on the main dashboard for users whose plans are about to expire (within 3 days) or have been suspended.
- Redesign the Dashboard cards and layout to match the new "feminine and modern" style (using the soft rose and ink palette).

### Phase 2: SuperAdmin Notification Tools
- In the SuperAdmin panel, add a "Notify" button for subscriptions expiring soon.
- This button will generate a pre-filled WhatsApp message for the seller, making it easy for the admin to handle "manual" notifications as requested.
- Ensure the "Renew Plan" options (1, 2, 3 months) are clearly visible and functional.

### Phase 3: Aesthetic Refinement
- Update icons and spacing in the Dashboard to feel more premium and reliable.
- Ensure mobile responsiveness for all new components.

## Technical Details
- Use the existing `handle_expired_subscriptions` RPC.
- Fetch user phone numbers from the `profiles` table for WhatsApp integration.
- Apply consistent branding from `styles.css` (primary: rose, background: blushes/neutrals).
