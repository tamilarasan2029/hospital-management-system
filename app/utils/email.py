import os
import smtplib
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)


def send_otp_email(to_email: str, otp: str) -> None:
    """Sends the OTP by real email if SMTP_* is configured in .env.
    If not configured, prints it to the backend console instead - this
    is the ONLY way to receive the code until a real mail server is set up,
    so check this terminal window after clicking 'Send Code' in the app."""
    if not (SMTP_HOST and SMTP_USER and SMTP_PASSWORD):
        print(f"\n{'=' * 50}")
        print(f"[DEV MODE - no SMTP configured] Password reset OTP")
        print(f"  To:  {to_email}")
        print(f"  OTP: {otp}  (valid for 10 minutes)")
        print(f"{'=' * 50}\n")
        return

    msg = MIMEText(f"Your Qwen Hospital password reset code is: {otp}\nIt expires in 10 minutes.")
    msg["Subject"] = "Your password reset code"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        # Don't let a broken mail server block the flow during development -
        # fall back to the console so testing can continue.
        print(f"[WARNING] Failed to send OTP email ({e}). OTP for {to_email}: {otp}")
