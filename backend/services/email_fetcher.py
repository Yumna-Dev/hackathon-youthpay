"""
email_fetcher.py — Gmail IMAP ingestion (bonus). No OAuth: uses a Gmail App
Password (single env var). Fetches recent emails from known Pakistani bank
senders and returns their raw text bodies for the parser.
"""

import imaplib
import email

PAKISTANI_BANK_SENDERS = [
    "alerts@ubl.com.pk",
    "noreply@meezanbank.com",
    "alerts@hbl.com",
    "noreply@nayapay.com",
    "alerts@jazzcash.com.pk",
    "transaction@alfalahghi.com",
    "alerts@bankislami.com.pk",
    "mirhazaya@gmail.com",  # demo sender — seeded bank-notification emails
]


def extract_text_body(msg) -> str:
    """Extract plain text from an email message, handling multipart."""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                payload = part.get_payload(decode=True)
                if payload:
                    return payload.decode("utf-8", errors="ignore")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            return payload.decode("utf-8", errors="ignore")
    return ""


def fetch_bank_emails(gmail_user: str, app_password: str, max_per_sender: int = 20) -> list[str]:
    """
    Connect to Gmail via IMAP, fetch the last N emails from each Pakistani bank
    sender. Returns a list of raw email body strings ready for parsing.
    """
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(gmail_user, app_password)
    mail.select("inbox")

    raw_notifications: list[str] = []

    for sender in PAKISTANI_BANK_SENDERS:
        status, msg_ids = mail.search(None, f'FROM "{sender}"')
        if status != "OK" or not msg_ids or not msg_ids[0]:
            continue
        ids = msg_ids[0].split()

        # Take last N only — avoid processing years of history.
        for msg_id in ids[-max_per_sender:]:
            _, data = mail.fetch(msg_id, "(RFC822)")
            if not data or not data[0]:
                continue
            msg = email.message_from_bytes(data[0][1])
            body = extract_text_body(msg)
            if body:
                raw_notifications.append(body.strip())

    mail.logout()
    return raw_notifications
