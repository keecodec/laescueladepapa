import os
import mysql.connector
from mysql.connector import pooling
import time

db_pool = None

def get_db_pool():
    global db_pool
    if db_pool is None:
        retries = 10
        while retries > 0:
            try:
                db_pool = mysql.connector.pooling.MySQLConnectionPool(
                    pool_name="mypool",
                    pool_size=5,
                    pool_reset_session=True,
                    host=os.environ.get('DB_HOST', 'db'),
                    database=os.environ.get('DB_NAME', 'academie'),
                    user=os.environ.get('DB_USER', 'user'),
                    password=os.environ.get('DB_PASSWORD', 'userpassword')
                )
                print("[SECURITY] Pool MySQL initialisé avec succès.")
                break
            except Exception as e:
                print(f"[SECURITY] En attente de MySQL (initialisation des tables)... encore {retries} essais.")
                time.sleep(3)
                retries -= 1
    return db_pool

def get_db_connection():
    pool = get_db_pool()
    if not pool:
        raise Exception("Impossible d'initialiser le pool de connexion MySQL.")
    return pool.get_connection()

def execute_query(query, params=(), fetch_one=False, fetch_all=False, commit=False):
    """
    Exécute une requête SQL de manière ultra-sécurisée via connection pool.
    """
    connection = get_db_connection()
    try:
        cursor = connection.cursor(prepared=True)
        cursor.execute(query, params)
        
        result = None
        if fetch_one:
            row = cursor.fetchone()
            if row:
                columns = [col[0] for col in cursor.description]
                result = dict(zip(columns, row))
        elif fetch_all:
            rows = cursor.fetchall()
            if rows:
                columns = [col[0] for col in cursor.description]
                result = [dict(zip(columns, row)) for row in rows]
            else:
                result = []
                
        if commit:
            connection.commit()
            
        return result
    finally:
        cursor.close()
        connection.close()
