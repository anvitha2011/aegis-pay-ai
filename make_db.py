import os
import sqlite3

os.makedirs('backend/db', exist_ok=True)
os.makedirs('backend/agents', exist_ok=True)
os.makedirs('backend/simulation', exist_ok=True)

telemetry_store_code = '''import sqlite3
import time
import random
from typing import List, Dict, Any

DB_PATH = 'telemetry.db'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp REAL,
        txn_id TEXT UNIQUE,
        amount REAL,
        payer_vpa TEXT,
        payee_vpa TEXT,
        rail TEXT,
        bank_switch TEXT,
        gateway TEXT,
        status TEXT,
        latency_ms REAL,
        error_code TEXT,
        error_message TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS node_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp REAL,
        node_id TEXT,
        node_type TEXT,
        tps REAL,
        p99_latency_ms REAL,
        active_connections INTEGER,
        connection_pool_saturation REAL,
        error_rate REAL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incident_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id TEXT UNIQUE,
        status TEXT,
        affected_node TEXT,
        severity TEXT,
        root_cause TEXT,
        mitigation_action TEXT,
        start_time REAL,
        resolved_time REAL
    )
    """)
    
    conn.commit()
    seed_data_if_empty(cursor, conn)
    conn.close()

def seed_data_if_empty(cursor, conn):
    cursor.execute("SELECT COUNT(*) FROM transactions")
    count = cursor.fetchone()[0]
    if count > 0:
        return

    now = time.time()
    banks = ['HDFC_CBS_01', 'SBI_CORE_02', 'ICICI_CBS_01', 'AXIS_CBS_01']
    gateways = ['RAZORPAY_GW', 'CASHFREE_GW', 'PINE_LABS', 'STRIPE_IN']
    rails = ['UPI_2_0', 'IMPS', 'RUPAY_TOKEN', 'CARDS']
    
    txns = []
    for i in range(400):
        t_offset = now - (400 - i) * 0.5
        bank = random.choice(banks)
        gw = random.choice(gateways)
        rail = random.choice(rails)
        amt = round(random.uniform(50.0, 15000.0), 2)
        vpa_payer = f"user{random.randint(100, 999)}@okhdfcbank"
        vpa_payee = f"merchant_{random.randint(10, 50)}@razorpay"
        latency = round(random.uniform(18.0, 36.0), 1)
        status = 'SUCCESS'
        err_code = None
        err_msg = None
        
        txns.append((t_offset, f"TXN_{random.randint(100000, 999999)}", amt, vpa_payer, vpa_payee, rail, bank, gw, status, latency, err_code, err_msg))
        
    cursor.executemany("""
    INSERT INTO transactions (timestamp, txn_id, amount, payer_vpa, payee_vpa, rail, bank_switch, gateway, status, latency_ms, error_code, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, txns)
    conn.commit()

def record_transaction(txn: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO transactions (timestamp, txn_id, amount, payer_vpa, payee_vpa, rail, bank_switch, gateway, status, latency_ms, error_code, error_message)
    VALUES (:timestamp, :txn_id, :amount, :payer_vpa, :payee_vpa, :rail, :bank_switch, :gateway, :status, :latency_ms, :error_code, :error_message)
    """, txn)
    conn.commit()
    conn.close()

def execute_sql_query(query: str) -> List[Dict[str, Any]]:
    query_upper = query.strip().upper()
    if not (query_upper.startswith("SELECT") or query_upper.startswith("WITH") or query_upper.startswith("EXPLAIN")):
        raise ValueError("AI SQL Tool is strictly read-only. Only SELECT statements permitted.")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    result = [dict(row) for row in rows]
    conn.close()
    return result

if __name__ == "__main__":
    init_db()
    print("Telemetry DB initialized successfully with seed transactions.")
'''

with open('backend/db/telemetry_store.py', 'w', encoding='utf-8') as f:
    f.write(telemetry_store_code)
print('telemetry_store.py generated.')
