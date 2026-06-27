# YouthPay Backend — Build Notes

## Phase 6 — Gmail IMAP (Bonus): **WORKING END-TO-END ✓**

UPDATE (2026-06-27): Gmail IMAP fully functional.
- Connected account (`GMAIL_USER`): `yunazaya2@gmail.com`.
- Seeded bank-notification emails are sent from `mirhazaya@gmail.com`, which is
  whitelisted in `PAKISTANI_BANK_SENDERS` (services/email_fetcher.py).
- `POST /api/fetch-emails` → `emails_fetched: 5, transactions_parsed: 5, failed: 0`.
  All 5 parse via regex (MINISO/Lifestyle, ESPRESSO/Coffee, ATM/Utilities,
  P2P Transfer, Parents/Allowance credit).
- The frontend `/ingest` "Fetch from Gmail" button calls this live and renders the
  parsed list (graceful "connection pending" message on failure).

### (Historical) Earlier blocker — now resolved:

The Gmail IMAP ingestion feature is fully implemented but **not yet verified end-to-end** because the live Gmail authentication fails.

**Implemented & code-verified:**
- `services/email_fetcher.py` — IMAP fetch from Pakistani bank senders (App Password, no OAuth).
- `routers/email_ingest.py` — `POST /api/fetch-emails`, wired into `main.py`.
- App boots cleanly with the router mounted.
- Secret gate works: wrong `secret` → `403`.
- On valid `secret`, the endpoint pipes fetched email bodies through `parse_notification`.

**Blocker — external (not a code issue):**
- Live IMAP login to Gmail returns `[AUTHENTICATIONFAILED] Invalid credentials`.
- Tested both the as-stored App Password (with spaces) and the 16-char stripped form — both rejected.
- `GMAIL_USER` currently set to `mirhazaya2@gmail.com`.

**To finish verification (account setup on the Gmail account):**
1. Enable **2-Step Verification** (App Passwords require it).
2. Generate a fresh **App Password** and put it in `backend/.env` → `GMAIL_APP_PASSWORD`.
3. Enable **IMAP** in Gmail settings (Forwarding and POP/IMAP → Enable IMAP).
4. Ensure `GMAIL_USER` matches the account that generated the App Password.
5. Re-run the IMAP connection test:
   ```bash
   python -c "import imaplib, os; from dotenv import load_dotenv; load_dotenv(override=True); m=imaplib.IMAP4_SSL('imap.gmail.com'); m.login(os.environ['GMAIL_USER'], os.environ['GMAIL_APP_PASSWORD']); print('IMAP CONNECTION PASS'); m.logout()"
   ```

## Model note
PRD pinned `llama-3.1-70b-versatile` (decommissioned by Groq). Using
`llama-3.3-70b-versatile` (official successor) for all LLM calls — see
`services/llm_service.py`.
