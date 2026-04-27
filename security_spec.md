# Firebase Security Specification - BPR Kreo Lestari Portal

## Data Invariants
1. **Document Integrity**: A document must contain extracted text (`content`) and a title. The `uploadedBy` field must match the authenticated user's UID.
2. **Privacy**: Chat sessions and messages are strictly restricted to the owner. No other user can read or write to another user's chat subcollection.
3. **Notification Safety**: Notifications are internal system messages. Users can read and mark them as read, but cannot create their own notifications (to prevent spam/spoofing). Note: For this demo, I'll allow creation if needed but ideally it's system-only. Actually, I'll restrict it to `isAdmin` or system logic.
4. **ID Hardening**: All document IDs must be validated to prevent exhaustion attacks.

## The Dirty Dozen (Malicious Payloads)

1. **Identity Theft (Document)**: User A tries to create a document with `uploadedBy: 'userB'`.
2. **Unauthorized Update**: User B tries to update User A's document `title`.
3. **Shadow Field Injection**: User A tries to add `isSecret: true` to a document.
4. **Chat Snooping**: User B tries to list `/chats` where `userId != userB`.
5. **Message Spoofing**: User A tries to write a message into User B's `/chats/{chatId}/messages`.
6. **Future Dating**: User A tries to set `createdAt` to a date in the year 2099.
7. **Junk ID Entry**: User A attempts to create a document with a 1MB string as the ID.
8. **PII Leak**: User A tries to read the `users` collection (if it existed) or search/list docs without being signed in.
9. **Notification Spoof**: User A tries to create a notification for User B.
10. **State Corruption**: User A tries to change `role` of a chat message from `user` to `admin` (if admin logic exists).
11. **Denial of Wallet**: User A attempts to upload an array of 10,000 tags in a document field.
12. **Orphaned Write**: User A tries to create a message in a non-existent chat session.

## Test Runner (Logic Verification)
The following tests in `firestore.rules.test.ts` (conceptual) will verify the rules.

- `test('deny unauthorized document creation')`
- `test('deny cross-user chat access')`
- `test('enforce server timestamp on updates')`
- `test('enforce exact schema on create')`
