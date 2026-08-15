"""
Taiwan Timezone (Asia/Taipei, UTC+8) Utilities for Heart Kids Wear.
Ensures all database timestamps, logs, and notifications use Taiwan Time.
"""
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

# Taiwan Timezone UTC+8
try:
    TAIWAN_TZ = ZoneInfo("Asia/Taipei")
except Exception:
    TAIWAN_TZ = timezone(timedelta(hours=8))

def get_taiwan_now() -> datetime:
    """Returns current datetime in Taiwan (Asia/Taipei, UTC+8)."""
    return datetime.now(TAIWAN_TZ)

def format_taiwan_datetime(dt: datetime, fmt: str = "%Y/%m/%d %H:%M") -> str:
    """Formats a datetime object to Taiwan time string."""
    if dt is None:
        return ""
    if dt.tzinfo is None:
        # Treat naive UTC datetime from database and convert to Taiwan time
        dt = dt.replace(tzinfo=timezone.utc).astimezone(TAIWAN_TZ)
    else:
        dt = dt.astimezone(TAIWAN_TZ)
    return dt.strftime(fmt)

def format_taiwan_date(dt: datetime, fmt: str = "%Y/%m/%d") -> str:
    """Formats a datetime object to Taiwan date string."""
    return format_taiwan_datetime(dt, fmt)
