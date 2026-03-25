import bcrypt
from db import execute_query, get_db_connection
import time

def seed_database():
    users = [
        ('admin', 'password', 'admin'),
        ('prof1', 'password', 'professor'),
        ('student1', 'password', 'student'),
        ('cpe1', 'password', 'staff')
    ]
    
    retries = 10
    while retries > 0:
        try:
            conn = get_db_connection()
            break
        except Exception as e:
            time.sleep(3)
            retries -= 1

    if not conn:
        print("Erreur: Impossible de se connecter à la base pour le seed.")
        return

    cursor = conn.cursor(prepared=True)
    
    # Hack DevSecOps : Injection dynamique du nouveau champ week_type sans avoir à casser/reconstruire le Volume Docker !
    try:
        ddl_cursor = conn.cursor()
        ddl_cursor.execute("ALTER TABLE schedules ADD COLUMN week_type ENUM('A', 'B', 'Toutes') DEFAULT 'Toutes'")
        ddl_cursor.close()
    except Exception:
        pass # La colonne existe déjà
        
    print("[SEED] Sécurisation des mots de passe (bcrypt)...")
    for username, plain_pass, role in users:
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        res = cursor.fetchone()
        hashed = bcrypt.hashpw(plain_pass.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        if not res:
            cursor.execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)", (username, hashed, role))
        else:
            cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", (hashed, username))
            
    print("[SEED] Mise à niveau du Cursus Lycée...")
    try:
        cursor.execute("INSERT IGNORE INTO classes (id, name, level) VALUES (1, 'Terminale S.1', 'Lycée')")
        
        subjects = ['Mathématiques', 'Histoire-Géo', 'Français', 'Physique-Chimie', 'SVT', 'EPS', 'Anglais', 'Espagnol', 'Philosophie']
        for i, sub in enumerate(subjects):
            cursor.execute("INSERT IGNORE INTO subjects (id, name) VALUES (%s, %s)", (i+1, sub))
        
        cursor.execute("SELECT id FROM users WHERE username='prof1'")
        prof_res = cursor.fetchone()
        cursor.execute("SELECT id FROM users WHERE username='student1'")
        stu_res = cursor.fetchone()

        if prof_res and stu_res:
            p_id = prof_res[0]
            s_id = stu_res[0]
            cursor.execute("INSERT IGNORE INTO user_classes (user_id, class_id) VALUES (%s, 1)", (p_id,))
            cursor.execute("INSERT IGNORE INTO user_classes (user_id, class_id) VALUES (%s, 1)", (s_id,))
            
            # Purge de l'EDI précédent
            cursor.execute("DELETE FROM schedules WHERE class_id=1")
            
            print("[SEED] Chargement des variations d'Agenda (Semaine A / Semaine B)...")
            schedules_data = [
                # Lundi
                (1, p_id, 1, 'B104', 'Lundi', '08:00', '10:00', 'Toutes'), # Maths
                (1, p_id, 4, 'C201', 'Lundi', '10:00', '12:00', 'Toutes'), # PC
                (1, p_id, 9, 'A102', 'Lundi', '13:00', '15:00', 'A'),      # Philo (Seulement Semaine A)
                (1, p_id, 2, 'A205', 'Lundi', '13:00', '15:00', 'B'),      # HG (Seulement Semaine B)
                (1, p_id, 7, 'B303', 'Lundi', '15:00', '17:00', 'Toutes'), # Anglais
                
                # Mardi
                (1, p_id, 3, 'A201', 'Mardi', '08:00', '10:00', 'Toutes'), # Français
                (1, p_id, 8, 'B304', 'Mardi', '10:00', '12:00', 'Toutes'), # Espagnol
                (1, p_id, 6, 'Gymnase', 'Mardi', '14:00', '16:00', 'A'),   # EPS (Seulement Semaine A)
                
                # Mercredi
                (1, p_id, 1, 'B104', 'Mercredi', '08:00', '10:00', 'Toutes'), # Maths
                (1, p_id, 5, 'Labo 1', 'Mercredi', '10:00', '12:00', 'Toutes'), # SVT
                
                # Jeudi
                (1, p_id, 2, 'A205', 'Jeudi', '08:00', '10:00', 'Toutes'), # HG
                (1, p_id, 9, 'A102', 'Jeudi', '10:00', '12:00', 'Toutes'), # Philo
                (1, p_id, 4, 'Labo PC', 'Jeudi', '14:00', '16:00', 'A'),   # PC TP (Semaine A)
                (1, p_id, 5, 'Labo SVT', 'Jeudi', '14:00', '16:00', 'B'),  # SVT TP (Semaine B)
                (1, p_id, 6, 'Gymnase', 'Jeudi', '16:00', '18:00', 'Toutes'), # EPS
                
                # Vendredi
                (1, p_id, 7, 'B303', 'Vendredi', '08:00', '10:00', 'Toutes'), # Anglais
                (1, p_id, 1, 'B104', 'Vendredi', '10:00', '12:00', 'Toutes'), # Maths
                (1, p_id, 8, 'B304', 'Vendredi', '14:00', '16:00', 'B')    # Espagnol (Semaine B)
            ]
            
            for sd in schedules_data:
                cursor.execute(
                    "INSERT INTO schedules (class_id, professor_id, subject_id, room, day_of_week, start_time, end_time, week_type) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                    sd
                )

    except Exception as e:
        print(f"[SEED ERROR] Erreur lors de l'insertion contextuelle : {e}")

    conn.commit()
    cursor.close()
    conn.close()
    print("[SEED] Opération terminée avec succès !")

if __name__ == '__main__':
    seed_database()
