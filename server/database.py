import sqlite3
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from server.config import settings

def get_db_connection() -> sqlite3.Connection:
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(settings.DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create database tables if they do not exist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Leads table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_number TEXT UNIQUE NOT NULL,
                lead_type TEXT NOT NULL,
                client_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                company TEXT,
                inn TEXT,
                delivery_address TEXT,
                comment TEXT,
                items_json TEXT,
                total_weight_kg REAL DEFAULT 0.0,
                file_path TEXT,
                status TEXT DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # ATR Protected Tokens table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS atr_tokens (
                token TEXT PRIMARY KEY,
                lead_id INTEGER,
                email TEXT NOT NULL,
                company TEXT NOT NULL,
                inn TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                download_count INTEGER DEFAULT 0,
                last_downloaded_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (lead_id) REFERENCES leads (id)
            )
        """)

        # Ensure 'manager' and 'updated_at' columns exist
        cursor.execute("PRAGMA table_info(leads)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'manager' not in columns:
            cursor.execute("ALTER TABLE leads ADD COLUMN manager TEXT")
        if 'updated_at' not in columns:
            cursor.execute("ALTER TABLE leads ADD COLUMN updated_at TIMESTAMP")

        conn.commit()

def generate_order_number(lead_type: str = "PP") -> str:
    """Generate sequential or timestamped human-readable order number, e.g. PP-2026-0142"""
    prefix = {
        "specification": "SPEC",
        "estimate": "EST",
        "callback": "CALL",
        "atr_request": "ATR"
    }.get(lead_type, "PP")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM leads")
        count = cursor.fetchone()[0] + 1
        year = datetime.now().year
        return f"{prefix}-{year}-{count:04d}"

def create_lead(
    lead_type: str,
    client_name: str,
    phone: str,
    email: Optional[str] = None,
    company: Optional[str] = None,
    inn: Optional[str] = None,
    delivery_address: Optional[str] = None,
    comment: Optional[str] = None,
    items: Optional[List[Dict[str, Any]]] = None,
    total_weight_kg: float = 0.0,
    file_path: Optional[str] = None
) -> Dict[str, Any]:
    """Insert a new lead record into the database."""
    order_number = generate_order_number(lead_type)
    items_json = json.dumps(items, ensure_ascii=False) if items else None

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO leads (
                order_number, lead_type, client_name, phone, email,
                company, inn, delivery_address, comment, items_json,
                total_weight_kg, file_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order_number, lead_type, client_name, phone, email,
            company, inn, delivery_address, comment, items_json,
            total_weight_kg, file_path
        ))
        lead_id = cursor.lastrowid
        conn.commit()

        cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
        row = cursor.fetchone()
        return dict(row)

def save_atr_token(token: str, lead_id: int, email: str, company: str, inn: str, expires_at: datetime):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO atr_tokens (token, lead_id, email, company, inn, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (token, lead_id, email, company, inn, expires_at.isoformat()))
        conn.commit()

def get_atr_token(token: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM atr_tokens WHERE token = ?", (token,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

def record_atr_download(token: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE atr_tokens
            SET download_count = download_count + 1,
                last_downloaded_at = CURRENT_TIMESTAMP
            WHERE token = ?
        """, (token,))
        conn.commit()

def update_lead_status(order_number: str, status: str, manager: Optional[str] = None) -> bool:
    """Update status and assigned manager for a lead."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if manager:
            cursor.execute("""
                UPDATE leads
                SET status = ?, manager = ?, updated_at = CURRENT_TIMESTAMP
                WHERE order_number = ?
            """, (status, manager, order_number))
        else:
            cursor.execute("""
                UPDATE leads
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE order_number = ?
            """, (status, order_number))
        conn.commit()
        return cursor.rowcount > 0

def get_lead_by_order_number(order_number: str) -> Optional[Dict[str, Any]]:
    """Retrieve single lead by human-readable order number."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM leads WHERE order_number = ?", (order_number,))
        row = cursor.fetchone()
        return dict(row) if row else None

def get_recent_leads(limit: int = 5) -> List[Dict[str, Any]]:
    """Retrieve last N leads ordered by creation time."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM leads ORDER BY created_at DESC LIMIT ?", (limit,))
        return [dict(row) for row in cursor.fetchall()]

def get_daily_stats() -> Dict[str, Any]:
    """Calculate lead statistics for today."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        today = datetime.now().strftime("%Y-%m-%d")
        cursor.execute("SELECT COUNT(*), COALESCE(SUM(total_weight_kg), 0) FROM leads WHERE date(created_at) = ?", (today,))
        total_count, total_weight = cursor.fetchone()
        
        cursor.execute("""
            SELECT lead_type, COUNT(*) 
            FROM leads 
            WHERE date(created_at) = ? 
            GROUP BY lead_type
        """, (today,))
        by_type = dict(cursor.fetchall())
        
        return {
            "total_count": total_count,
            "total_weight_kg": total_weight,
            "by_type": by_type,
            "date": today
        }

# Ensure tables are ready on module load
init_db()
