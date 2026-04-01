from flask import Blueprint, request, jsonify, session
import bcrypt
import re
from db import execute_query
from auth import login_required, role_required

api_bp = Blueprint('api_routes', __name__)

MAX_LENGTHS = {
    'username': 50,
    'name': 100,
    'room': 50,
    'content': 5000,
    'comments': 1000,
    'reason': 1000,
}

def check_length(value, field):
    if value and len(str(value)) > MAX_LENGTHS.get(field, 500):
        return True
    return False


def ensure_teaching_assignments_table():
    from db import get_db_connection

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teaching_assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                professor_id INT NOT NULL,
                subject_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uniq_class_subject (class_id, subject_id),
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

# ==========================================
# 👨‍🎓 ESPACE ÉLÈVE (Visualisation read-only)
# ==========================================

@api_bp.route('/student/grades', methods=['GET'])
@login_required
@role_required('student')
def get_grades():
    student_id = session['user_id']
    
    raw_grades = execute_query("""
        SELECT CAST(g.grade AS CHAR) as grade, g.comments, s.id as subject_id, s.name as subject, DATE_FORMAT(g.created_at, '%d/%m/%Y') as date
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        WHERE g.student_id = %s
        ORDER BY g.created_at DESC
    """, (student_id,), fetch_all=True)
    
    class_avgs_raw = execute_query("""
        SELECT g.subject_id, CAST(AVG(g.grade) AS CHAR) as class_avg
        FROM grades g
        JOIN user_classes uc ON g.class_id = uc.class_id
        WHERE uc.user_id = %s
        GROUP BY g.subject_id
    """, (student_id,), fetch_all=True)
    
    class_avg_dict = {row['subject_id']: float(row['class_avg']) for row in class_avgs_raw}
    
    subjects_dict = {}
    for r in raw_grades:
        sid = r['subject_id']
        sname = r['subject']
        val = float(r['grade'])
        if sid not in subjects_dict:
            subjects_dict[sid] = {
                'name': sname,
                'grades': [],
                'class_average': class_avg_dict.get(sid, None)
            }
        subjects_dict[sid]['grades'].append({
            'grade': val,
            'comments': r['comments'],
            'date': r['date']
        })
        
    for sid, data in subjects_dict.items():
        vals = [g['grade'] for g in data['grades']]
        data['student_average'] = round(sum(vals) / len(vals), 2) if vals else None
        
    student_avgs = [data['student_average'] for data in subjects_dict.values() if data['student_average'] is not None]
    general_student_avg = round(sum(student_avgs) / len(student_avgs), 2) if student_avgs else None
    
    class_avgs = [data['class_average'] for data in subjects_dict.values() if data['class_average'] is not None]
    general_class_avg = round(sum(class_avgs) / len(class_avgs), 2) if class_avgs else None
    
    return jsonify({
        "general_student_average": general_student_avg,
        "general_class_average": general_class_avg,
        "subjects": list(subjects_dict.values())
    }), 200

@api_bp.route('/student/homework', methods=['GET'])
@login_required
@role_required('student')
def get_homework():
    student_id = session['user_id']
    query = """
        SELECT DATE_FORMAT(t.date_given, '%d/%m/%Y') as date_given, DATE_FORMAT(t.date_due, '%d/%m/%Y') as date_due, t.content, s.name as subject
        FROM textbook t
        JOIN subjects s ON t.subject_id = s.id
        JOIN user_classes uc ON t.class_id = uc.class_id
        WHERE uc.user_id = %s AND t.is_homework = TRUE
        ORDER BY t.date_due ASC
    """
    homework = execute_query(query, (student_id,), fetch_all=True)
    return jsonify(homework), 200

@api_bp.route('/student/schedule', methods=['GET'])
@login_required
@role_required('student')
def get_schedule():
    student_id = session['user_id']
    query = """
        SELECT sch.day_of_week, TIME_FORMAT(sch.start_time, '%H:%i') as start_time, TIME_FORMAT(sch.end_time, '%H:%i') as end_time, sch.room, s.name as subject, u.username as professor, sch.week_type
        FROM schedules sch
        JOIN subjects s ON sch.subject_id = s.id
        JOIN users u ON sch.professor_id = u.id
        JOIN user_classes uc ON sch.class_id = uc.class_id
        WHERE uc.user_id = %s
        ORDER BY FIELD(sch.day_of_week, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'), sch.start_time
    """
    schedule = execute_query(query, (student_id,), fetch_all=True)
    return jsonify(schedule), 200

@api_bp.route('/student/absences', methods=['GET'])
@login_required
@role_required('student')
def get_absences():
    student_id = session['user_id']
    query = """
        SELECT DATE_FORMAT(date, '%d/%m/%Y') as date, is_late, justified, comments
        FROM absences
        WHERE student_id = %s
        ORDER BY date DESC
    """
    absences = execute_query(query, (student_id,), fetch_all=True)
    return jsonify(absences), 200

@api_bp.route('/student/sanctions', methods=['GET'])
@login_required
@role_required('student')
def get_student_sanctions():
    student_id = session['user_id']
    query = """
        SELECT type, reason, DATE_FORMAT(date, '%d/%m/%Y') as date
        FROM sanctions
        WHERE student_id = %s
        ORDER BY date DESC, id DESC
    """
    sanctions = execute_query(query, (student_id,), fetch_all=True)
    return jsonify(sanctions), 200

# ==========================================
# ⚙️ ESPACE ADMINSYS (Configuration & CRUD)
# ==========================================

@api_bp.route('/admin/classes', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def get_classes():
    if request.method == 'POST':
        data = request.get_json()
        name = (data.get('name') or '').strip()
        level = (data.get('level') or '').strip()

        if not name:
            return jsonify({"error": "Le nom de la classe est obligatoire."}), 400

        existing = execute_query("SELECT id FROM classes WHERE name = %s", (name,), fetch_one=True)
        if existing:
            return jsonify({"error": "Cette classe existe deja."}), 400

        execute_query(
            "INSERT INTO classes (name, level) VALUES (%s, %s)",
            (name, level or None),
            commit=True
        )

        ip_addr = request.remote_addr or 'unknown'
        execute_query(
            "INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)",
            (session['user_id'], name, "CLASS_CREATED", ip_addr),
            commit=True
        )
        return jsonify({"message": f"Classe '{name}' creee avec succes."}), 201

    classes_list = execute_query("SELECT id, name, level FROM classes ORDER BY name", fetch_all=True)
    return jsonify(classes_list), 200

@api_bp.route('/admin/subjects', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def manage_subjects():
    if request.method == 'POST':
        data = request.get_json()
        name = (data.get('name') or '').strip()

        if not name:
            return jsonify({"error": "Le nom de la matiere est obligatoire."}), 400

        existing = execute_query("SELECT id FROM subjects WHERE name = %s", (name,), fetch_one=True)
        if existing:
            return jsonify({"error": "Cette matiere existe deja."}), 400

        execute_query(
            "INSERT INTO subjects (name) VALUES (%s)",
            (name,),
            commit=True
        )

        ip_addr = request.remote_addr or 'unknown'
        execute_query(
            "INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)",
            (session['user_id'], name, "SUBJECT_CREATED", ip_addr),
            commit=True
        )
        return jsonify({"message": f"Matiere '{name}' ajoutee au catalogue."}), 201

    subjects = execute_query("SELECT id, name FROM subjects ORDER BY name", fetch_all=True)
    return jsonify(subjects), 200

@api_bp.route('/admin/dashboard', methods=['GET'])
@login_required
@role_required('admin')
def get_admin_dashboard():
    ensure_teaching_assignments_table()
    metrics = execute_query("""
        SELECT
            (SELECT COUNT(*) FROM users) as users_total,
            (SELECT COUNT(*) FROM users WHERE role = 'student') as students_total,
            (SELECT COUNT(*) FROM users WHERE role = 'professor') as professors_total,
            (SELECT COUNT(*) FROM users WHERE role = 'staff') as staff_total,
            (SELECT COUNT(*) FROM classes) as classes_total,
            (SELECT COUNT(*) FROM subjects) as subjects_total,
            (SELECT COUNT(*) FROM teaching_assignments) as assignments_total
    """, fetch_one=True)

    recent_users = execute_query("""
        SELECT username, role, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 6
    """, fetch_all=True)

    try:
        recent_audits = execute_query("""
            SELECT action, username_attempt, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at
            FROM audit_logs
            ORDER BY created_at DESC
            LIMIT 8
        """, fetch_all=True)
    except Exception:
        recent_audits = []

    return jsonify({
        "metrics": metrics,
        "recent_users": recent_users,
        "recent_audits": recent_audits
    }), 200

@api_bp.route('/admin/professors', methods=['GET'])
@login_required
@role_required('admin')
def get_professors():
    professors = execute_query("""
        SELECT id, username
        FROM users
        WHERE role = 'professor'
        ORDER BY username
    """, fetch_all=True)
    return jsonify(professors), 200


@api_bp.route('/admin/assignments', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def manage_assignments():
    ensure_teaching_assignments_table()

    if request.method == 'POST':
        data = request.get_json()
        class_id = data.get('class_id')
        professor_id = data.get('professor_id')
        subject_id = data.get('subject_id')

        if not all([class_id, professor_id, subject_id]):
            return jsonify({"error": "Classe, professeur et matiere sont obligatoires."}), 400

        existing = execute_query(
            "SELECT id FROM teaching_assignments WHERE class_id = %s AND subject_id = %s",
            (class_id, subject_id),
            fetch_one=True
        )
        if existing:
            return jsonify({"error": "Cette matiere est deja affectee a une classe."}), 400

        execute_query(
            "INSERT INTO teaching_assignments (class_id, professor_id, subject_id) VALUES (%s, %s, %s)",
            (class_id, professor_id, subject_id),
            commit=True
        )

        ip_addr = request.remote_addr or 'unknown'
        execute_query(
            "INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)",
            (session['user_id'], f"class:{class_id}/subject:{subject_id}", "ASSIGNMENT_CREATED", ip_addr),
            commit=True
        )
        return jsonify({"message": "Affectation pedagogique enregistree."}), 201

    assignments = execute_query("""
        SELECT
            ta.id,
            c.id as class_id,
            c.name as class_name,
            s.id as subject_id,
            s.name as subject_name,
            u.id as professor_id,
            u.username as professor_username
        FROM teaching_assignments ta
        JOIN classes c ON c.id = ta.class_id
        JOIN subjects s ON s.id = ta.subject_id
        JOIN users u ON u.id = ta.professor_id
        ORDER BY c.name, s.name
    """, fetch_all=True)
    return jsonify(assignments), 200


@api_bp.route('/admin/assignments/<int:assignment_id>', methods=['DELETE'])
@login_required
@role_required('admin')
def delete_assignment(assignment_id):
    ensure_teaching_assignments_table()
    existing = execute_query("SELECT id FROM teaching_assignments WHERE id = %s", (assignment_id,), fetch_one=True)
    if not existing:
        return jsonify({"error": "Affectation introuvable."}), 404

    execute_query("DELETE FROM teaching_assignments WHERE id = %s", (assignment_id,), commit=True)

    ip_addr = request.remote_addr or 'unknown'
    execute_query(
        "INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)",
        (session['user_id'], f"assignment:{assignment_id}", "ASSIGNMENT_DELETED", ip_addr),
        commit=True
    )
    return jsonify({"message": "Affectation supprimee."}), 200

@api_bp.route('/admin/schedules', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def manage_schedules():
    ensure_teaching_assignments_table()
    if request.method == 'POST':
        data = request.get_json()
        class_id = data.get('class_id')
        professor_id = data.get('professor_id')
        subject_id = data.get('subject_id')
        room = (data.get('room') or '').strip()
        day_of_week = data.get('day_of_week')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        week_type = data.get('week_type', 'Toutes')

        allowed_days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        allowed_week_types = ['A', 'B', 'Toutes']

        if not all([class_id, professor_id, subject_id, room, day_of_week, start_time, end_time]):
            return jsonify({"error": "Tous les champs du creneau sont obligatoires."}), 400

        if day_of_week not in allowed_days:
            return jsonify({"error": "Jour invalide."}), 400

        if week_type not in allowed_week_types:
            return jsonify({"error": "Type de semaine invalide."}), 400

        assignment = execute_query(
            "SELECT id FROM teaching_assignments WHERE class_id = %s AND subject_id = %s",
            (class_id, subject_id),
            fetch_one=True
        )
        if assignment:
            execute_query(
                "UPDATE teaching_assignments SET professor_id = %s WHERE id = %s",
                (professor_id, assignment['id']),
                commit=True
            )
        else:
            execute_query(
                "INSERT INTO teaching_assignments (class_id, professor_id, subject_id) VALUES (%s, %s, %s)",
                (class_id, professor_id, subject_id),
                commit=True
            )

        execute_query(
            """
            INSERT INTO schedules (class_id, professor_id, subject_id, room, day_of_week, start_time, end_time, week_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (class_id, professor_id, subject_id, room, day_of_week, start_time, end_time, week_type),
            commit=True
        )

        ip_addr = request.remote_addr or 'unknown'
        execute_query(
            "INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)",
            (session['user_id'], f"class:{class_id}", "SCHEDULE_CREATED", ip_addr),
            commit=True
        )

        return jsonify({"message": "Creneau ajoute a l'emploi du temps."}), 201

    schedules = execute_query("""
        SELECT
            sch.id,
            c.name as class_name,
            u.username as professor_username,
            s.name as subject_name,
            sch.room,
            sch.day_of_week,
            TIME_FORMAT(sch.start_time, '%H:%i') as start_time,
            TIME_FORMAT(sch.end_time, '%H:%i') as end_time,
            sch.week_type
        FROM schedules sch
        JOIN classes c ON c.id = sch.class_id
        JOIN users u ON u.id = sch.professor_id
        JOIN subjects s ON s.id = sch.subject_id
        ORDER BY FIELD(sch.day_of_week, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'), sch.start_time, c.name
    """, fetch_all=True)
    return jsonify(schedules), 200

@api_bp.route('/admin/schedules/<int:schedule_id>', methods=['DELETE'])
@login_required
@role_required('admin')
def delete_schedule(schedule_id):
    existing = execute_query("SELECT id FROM schedules WHERE id = %s", (schedule_id,), fetch_one=True)
    if not existing:
        return jsonify({"error": "Creneau introuvable."}), 404

    execute_query("DELETE FROM schedules WHERE id = %s", (schedule_id,), commit=True)

    ip_addr = request.remote_addr or 'unknown'
    execute_query(
        "INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)",
        (session['user_id'], f"schedule:{schedule_id}", "SCHEDULE_DELETED", ip_addr),
        commit=True
    )
    return jsonify({"message": "Creneau supprime."}), 200

@api_bp.route('/admin/users', methods=['GET', 'POST'])
@login_required
@role_required('admin')
def manage_users():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')
        class_id = data.get('class_id')
        
        if not username or not password or not role:
            return jsonify({"error": "Veuillez remplir tous les champs obligatoires"}), 400

        if check_length(username, 'username') or check_length(password, 'username'):
            return jsonify({"error": "Champ trop long"}), 400
            
        if role not in ['admin', 'professor', 'student', 'staff']:
            return jsonify({"error": "Violation d'intégrité : Rôle inconnu"}), 400
            
        if not re.match(r'^[\w.-]+$', username):
            return jsonify({"error": "Nom d'utilisateur invalide"}), 400

        if len(password) < 8:
            return jsonify({"error": "Le mot de passe doit contenir au moins 8 caractères"}), 400

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        existing = execute_query("SELECT id FROM users WHERE username=%s", (username,), fetch_one=True)
        if existing:
            return jsonify({"error": "Cet identifiant est déjà utilisé."}), 400
            
        # Transaction SQL Database pour garantir la liaison
        from db import get_db_connection
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)",
                (username, hashed, role)
            )
            new_user_id = cursor.lastrowid
            
            if class_id and role in ['student', 'professor']:
                cursor.execute(
                    "INSERT INTO user_classes (user_id, class_id) VALUES (%s, %s)",
                    (new_user_id, class_id)
                )
            
            # Monitoring Sécurité : Traçabilité des actions CRUD Administrateur
            ip_addr = request.remote_addr or 'unknown'
            cursor.execute("INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)", 
                           (session['user_id'], username, f"USER_CREATED_{role.upper()}", ip_addr))
                           
            conn.commit()
            return jsonify({"message": f"Succès : Le compte {role} pour '{username}' a été créé."}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({"error": "Erreur interne de la base de données."}), 500
        finally:
            cursor.close()
            conn.close()
            
    # GET: Récupère la liste des utilisateurs de manière complète
    query = """
        SELECT u.id, u.username, u.role, DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i') as created_at, GROUP_CONCAT(c.name) as classes
        FROM users u
        LEFT JOIN user_classes uc ON u.id = uc.user_id
        LEFT JOIN classes c ON uc.class_id = c.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    """
    users_list = execute_query(query, fetch_all=True)
    return jsonify(users_list), 200

@api_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@login_required
@role_required('admin')
def delete_user(user_id):
    if user_id == session['user_id']:
        return jsonify({"error": "Vous ne pouvez pas auto-détruire votre propre compte superadmin."}), 400
        
    execute_query("DELETE FROM users WHERE id = %s", (user_id,), commit=True)
    
    # Audit trail
    ip_addr = request.remote_addr or 'unknown'
    execute_query("INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)", 
                  (session['user_id'], f"ID:{user_id}", "USER_DELETED", ip_addr), commit=True)
                  
    return jsonify({"message": f"Utilisateur ID #{user_id} a été supprimé définitivement."}), 200

@api_bp.route('/admin/audit', methods=['GET'])
@login_required
@role_required('admin')
def get_audit_logs():
    query = """
        SELECT id, COALESCE(user_id, 'N/A') as user_id, username_attempt, action, ip_address, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as date
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 100
    """
    logs = execute_query(query, fetch_all=True)
    return jsonify(logs), 200

# ==========================================
# 👨‍🏫 ESPACE PROFESSEUR (Saisie & Gestion)
# ==========================================

@api_bp.route('/professor/schedule', methods=['GET'])
@login_required
@role_required('professor')
def get_prof_schedule():
    prof_id = session['user_id']
    query = """
        SELECT sch.day_of_week, TIME_FORMAT(sch.start_time, '%H:%i') as start_time, TIME_FORMAT(sch.end_time, '%H:%i') as end_time, sch.room, s.name as subject, c.name as class_name, sch.week_type
        FROM schedules sch
        JOIN subjects s ON sch.subject_id = s.id
        JOIN classes c ON sch.class_id = c.id
        WHERE sch.professor_id = %s
        ORDER BY FIELD(sch.day_of_week, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'), sch.start_time
    """
    schedule = execute_query(query, (prof_id,), fetch_all=True)
    return jsonify(schedule), 200

@api_bp.route('/professor/dashboard', methods=['GET'])
@login_required
@role_required('professor')
def get_prof_dashboard():
    ensure_teaching_assignments_table()
    prof_id = session['user_id']

    metrics = execute_query("""
        SELECT
            COUNT(DISTINCT sch.class_id) as classes_total,
            COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END) as students_total
        FROM schedules sch
        LEFT JOIN user_classes uc ON uc.class_id = sch.class_id
        LEFT JOIN users u ON u.id = uc.user_id
        WHERE sch.professor_id = %s
    """, (prof_id,), fetch_one=True)

    grade_stats = execute_query("""
        SELECT COUNT(*) as grades_total
        FROM grades
        WHERE professor_id = %s
    """, (prof_id,), fetch_one=True)

    homework_stats = execute_query("""
        SELECT COUNT(*) as homework_total
        FROM textbook
        WHERE professor_id = %s AND is_homework = TRUE
    """, (prof_id,), fetch_one=True)

    next_courses = execute_query("""
        SELECT c.name as class_name, s.name as subject, sch.day_of_week, TIME_FORMAT(sch.start_time, '%H:%i') as start_time, TIME_FORMAT(sch.end_time, '%H:%i') as end_time, sch.room, sch.week_type
        FROM schedules sch
        JOIN classes c ON c.id = sch.class_id
        JOIN subjects s ON s.id = sch.subject_id
        WHERE sch.professor_id = %s
        ORDER BY FIELD(sch.day_of_week, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'), sch.start_time
        LIMIT 6
    """, (prof_id,), fetch_all=True)

    recent_grades = execute_query("""
        SELECT u.username as student_username, s.name as subject, CAST(g.grade AS CHAR) as grade, DATE_FORMAT(g.created_at, '%d/%m/%Y') as date
        FROM grades g
        JOIN users u ON u.id = g.student_id
        JOIN subjects s ON s.id = g.subject_id
        WHERE g.professor_id = %s
        ORDER BY g.created_at DESC
        LIMIT 6
    """, (prof_id,), fetch_all=True)

    recent_homework = execute_query("""
        SELECT c.name as class_name, s.name as subject, DATE_FORMAT(date_due, '%d/%m/%Y') as date_due, content
        FROM textbook t
        JOIN classes c ON c.id = t.class_id
        JOIN subjects s ON s.id = t.subject_id
        WHERE t.professor_id = %s AND t.is_homework = TRUE
        ORDER BY t.created_at DESC
        LIMIT 5
    """, (prof_id,), fetch_all=True)

    return jsonify({
        "metrics": {
            **(metrics or {}),
            "grades_total": grade_stats['grades_total'] if grade_stats else 0,
            "homework_total": homework_stats['homework_total'] if homework_stats else 0
        },
        "next_courses": next_courses,
        "recent_grades": recent_grades,
        "recent_homework": recent_homework
    }), 200

@api_bp.route('/professor/classes', methods=['GET'])
@login_required
@role_required('professor')
def get_prof_classes():
    ensure_teaching_assignments_table()
    prof_id = session['user_id']
    query = """
        SELECT ta.id as assignment_id, c.id, c.name, c.level, s.id as subject_id, s.name as subject
        FROM teaching_assignments ta
        JOIN classes c ON c.id = ta.class_id
        JOIN subjects s ON s.id = ta.subject_id
        WHERE ta.professor_id = %s
        ORDER BY c.name, s.name
    """
    classes = execute_query(query, (prof_id,), fetch_all=True)
    return jsonify(classes), 200

@api_bp.route('/professor/students/<int:class_id>', methods=['GET'])
@login_required
@role_required('professor')
def get_prof_students(class_id):
    ensure_teaching_assignments_table()
    assignment = execute_query(
        "SELECT id FROM teaching_assignments WHERE class_id = %s AND professor_id = %s LIMIT 1",
        (class_id, session['user_id']),
        fetch_one=True
    )
    if not assignment:
        return jsonify({"error": "Classe non accessible pour ce professeur."}), 403

    query = """
        SELECT u.id, u.username
        FROM users u
        JOIN user_classes uc ON u.id = uc.user_id
        WHERE uc.class_id = %s AND u.role = 'student'
        ORDER BY u.username
    """
    students = execute_query(query, (class_id,), fetch_all=True)
    return jsonify(students), 200

@api_bp.route('/professor/grades', methods=['POST'])
@login_required
@role_required('professor')
def add_grade():
    ensure_teaching_assignments_table()
    prof_id = session['user_id']
    data = request.get_json()
    assignment_id = data.get('assignment_id')
    student_id = data.get('student_id')
    grade = data.get('grade')
    comments = data.get('comments', '')

    if check_length(comments, 'comments'):
        return jsonify({"error": "Commentaire trop long"}), 400

    assignment = execute_query(
        """
        SELECT id, class_id, subject_id
        FROM teaching_assignments
        WHERE id = %s AND professor_id = %s
        """,
        (assignment_id, prof_id),
        fetch_one=True
    )
    if not assignment:
        return jsonify({"error": "Vous n'etes pas affecte a cette matiere pour cette classe."}), 403

    class_id = assignment['class_id']
    subject_id = assignment['subject_id']

    # IDOR protection: verify student belongs to this class
    try:
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Identifiant élève invalide"}), 400

    student_in_class = execute_query(
        "SELECT u.id FROM users u JOIN user_classes uc ON u.id = uc.user_id WHERE u.id = %s AND uc.class_id = %s AND u.role = 'student'",
        (student_id, class_id),
        fetch_one=True
    )
    if not student_in_class:
        return jsonify({"error": "Cet élève n'appartient pas à cette classe"}), 403

    try:
        grade = float(grade)
        if grade < 0 or grade > 20: raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "La note doit être comprise entre 0 et 20"}), 400

    execute_query(
        "INSERT INTO grades (student_id, professor_id, class_id, subject_id, grade, comments) VALUES (%s, %s, %s, %s, %s, %s)",
        (student_id, prof_id, class_id, subject_id, grade, comments),
        commit=True
    )
    return jsonify({"message": "Note enregistrée avec succès dans le dossier de l'élève"}), 201

@api_bp.route('/professor/homework', methods=['POST'])
@login_required
@role_required('professor')
def add_homework():
    ensure_teaching_assignments_table()
    prof_id = session['user_id']
    data = request.get_json()
    assignment_id = data.get('assignment_id')
    date_due = data.get('date_due')
    content = data.get('content')

    if check_length(content, 'content'):
        return jsonify({"error": "Contenu trop long"}), 400

    assignment = execute_query(
        """
        SELECT id, class_id, subject_id
        FROM teaching_assignments
        WHERE id = %s AND professor_id = %s
        """,
        (assignment_id, prof_id),
        fetch_one=True
    )
    if not assignment:
        return jsonify({"error": "Affectation invalide academiquement."}), 403

    class_id = assignment['class_id']
    subject_id = assignment['subject_id']
    
    execute_query(
        "INSERT INTO textbook (class_id, professor_id, subject_id, date_due, content, is_homework) VALUES (%s, %s, %s, %s, %s, TRUE)",
        (class_id, prof_id, subject_id, date_due, content),
        commit=True
    )
    return jsonify({"message": "Travail publié sur le cahier de textes de la classe"}), 201

# ==========================================
# 📋 ESPACE STAFF / VIE SCOLAIRE
# ==========================================

@api_bp.route('/staff/students', methods=['GET'])
@login_required
@role_required('staff')
def get_all_students():
    query = """
        SELECT u.id, u.username, c.id as class_id, c.name as class_name
        FROM users u
        LEFT JOIN user_classes uc ON u.id = uc.user_id
        LEFT JOIN classes c ON uc.class_id = c.id
        WHERE u.role = 'student'
        ORDER BY c.name, u.username
    """
    students = execute_query(query, fetch_all=True)
    return jsonify(students), 200

@api_bp.route('/staff/absences', methods=['GET'])
@login_required
@role_required('staff')
def get_staff_absences():
    query = """
        SELECT
            a.id,
            DATE_FORMAT(a.date, '%d/%m/%Y') as date,
            a.is_late,
            a.justified,
            a.comments,
            u.username as student_username,
            c.name as class_name
        FROM absences a
        JOIN users u ON u.id = a.student_id
        LEFT JOIN user_classes uc ON uc.user_id = u.id
        LEFT JOIN classes c ON c.id = uc.class_id
        ORDER BY a.date DESC, a.id DESC
        LIMIT 50
    """
    absences = execute_query(query, fetch_all=True)
    return jsonify(absences), 200

@api_bp.route('/staff/absences', methods=['POST'])
@login_required
@role_required('staff')
def add_absence():
    data = request.get_json()
    student_id = data.get('student_id')
    date_abs = data.get('date')
    is_late = data.get('is_late', False)
    justified = data.get('justified', False)
    comments = data.get('comments', '')
    
    if not student_id or not date_abs:
        return jsonify({"error": "L'élève et la date sont nécessaires."}), 400

    # Validate student_id is integer
    try:
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Identifiant élève invalide"}), 400

    # Validate date is not in the future
    from datetime import date as date_type
    try:
        parts = date_abs.split('-')
        abs_date = date_type(int(parts[0]), int(parts[1]), int(parts[2]))
        if abs_date > date_type.today():
            return jsonify({"error": "La date ne peut pas être dans le futur"}), 400
    except (ValueError, IndexError, AttributeError):
        return jsonify({"error": "Format de date invalide"}), 400

    if check_length(comments, 'comments'):
        return jsonify({"error": "Commentaire trop long"}), 400

    execute_query(
        "INSERT INTO absences (student_id, date, is_late, justified, comments) VALUES (%s, %s, %s, %s, %s)",
        (student_id, date_abs, is_late, justified, comments),
        commit=True
    )
    return jsonify({"message": "Incident comportemental / retard ajouté stricto sensu."}), 201

@api_bp.route('/staff/sanctions', methods=['GET'])
@login_required
@role_required('staff')
def get_sanctions():
    query = """
        SELECT
            s.id,
            stu.username AS student_username,
            c.name AS class_name,
            s.type,
            s.reason,
            DATE_FORMAT(s.date, '%d/%m/%Y') AS date,
            staff.username AS staff_username
        FROM sanctions s
        JOIN users stu ON s.student_id = stu.id
        LEFT JOIN user_classes uc ON uc.user_id = stu.id
        LEFT JOIN classes c ON c.id = uc.class_id
        JOIN users staff ON s.staff_id = staff.id
        ORDER BY s.date DESC, s.id DESC
        LIMIT 50
    """
    sanctions = execute_query(query, fetch_all=True)
    return jsonify(sanctions), 200

@api_bp.route('/staff/sanctions', methods=['POST'])
@login_required
@role_required('staff')
def add_sanction():
    data = request.get_json()
    student_id = data.get('student_id')
    sanction_type = data.get('type')
    reason = (data.get('reason') or '').strip()
    sanction_date = data.get('date')

    allowed_types = ['Observation', 'Avertissement', 'Retenue', 'Exclusion']

    if not student_id or not sanction_date or not reason:
        return jsonify({"error": "L'élève, la date et le motif sont obligatoires."}), 400

    # Validate student_id type
    try:
        student_id = int(student_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Identifiant élève invalide"}), 400

    if check_length(reason, 'reason'):
        return jsonify({"error": "Motif trop long"}), 400

    if sanction_type not in allowed_types:
        return jsonify({"error": "Type de sanction invalide."}), 400

    # Validate date format
    from datetime import date as date_type
    try:
        parts = sanction_date.split('-')
        date_type(int(parts[0]), int(parts[1]), int(parts[2]))
    except (ValueError, IndexError, AttributeError):
        return jsonify({"error": "Format de date invalide"}), 400

    student = execute_query(
        "SELECT id, username FROM users WHERE id = %s AND role = 'student'",
        (student_id,),
        fetch_one=True
    )
    if not student:
        return jsonify({"error": "Élève introuvable."}), 404

    execute_query(
        "INSERT INTO sanctions (student_id, staff_id, type, reason, date) VALUES (%s, %s, %s, %s, %s)",
        (student_id, session['user_id'], sanction_type, reason, sanction_date),
        commit=True
    )

    ip_addr = request.remote_addr or 'unknown'
    execute_query(
        "INSERT INTO audit_logs (user_id, username_attempt, action, ip_address) VALUES (%s, %s, %s, %s)",
        (session['user_id'], student['username'], f"SANCTION_CREATED_{sanction_type.upper()}", ip_addr),
        commit=True
    )

    return jsonify({"message": f"Sanction '{sanction_type}' ajoutee au dossier de {student['username']}."}), 201

@api_bp.route('/staff/dashboard', methods=['GET'])
@login_required
@role_required('staff')
def get_staff_dashboard():
    metrics = execute_query("""
        SELECT
            (SELECT COUNT(*) FROM absences) as absences_total,
            (SELECT COUNT(*) FROM absences WHERE justified = FALSE) as unjustified_total,
            (SELECT COUNT(*) FROM sanctions) as sanctions_total,
            (SELECT COUNT(*) FROM absences WHERE date = CURDATE()) + (SELECT COUNT(*) FROM sanctions WHERE date = CURDATE()) as incidents_today
    """, fetch_one=True)

    recent_absences = execute_query("""
        SELECT
            u.username as student_username,
            c.name as class_name,
            DATE_FORMAT(a.date, '%d/%m/%Y') as date,
            a.is_late,
            a.justified,
            a.comments
        FROM absences a
        JOIN users u ON u.id = a.student_id
        LEFT JOIN user_classes uc ON uc.user_id = u.id
        LEFT JOIN classes c ON c.id = uc.class_id
        ORDER BY a.date DESC, a.id DESC
        LIMIT 6
    """, fetch_all=True)

    recent_sanctions = execute_query("""
        SELECT
            u.username as student_username,
            c.name as class_name,
            s.type,
            s.reason,
            DATE_FORMAT(s.date, '%d/%m/%Y') as date
        FROM sanctions s
        JOIN users u ON u.id = s.student_id
        LEFT JOIN user_classes uc ON uc.user_id = u.id
        LEFT JOIN classes c ON c.id = uc.class_id
        ORDER BY s.date DESC, s.id DESC
        LIMIT 6
    """, fetch_all=True)

    top_students = execute_query("""
        SELECT
            u.username,
            c.name as class_name,
            SUM(events.total) as incidents_total
        FROM (
            SELECT student_id, COUNT(*) as total FROM absences GROUP BY student_id
            UNION ALL
            SELECT student_id, COUNT(*) as total FROM sanctions GROUP BY student_id
        ) events
        JOIN users u ON u.id = events.student_id
        LEFT JOIN user_classes uc ON uc.user_id = u.id
        LEFT JOIN classes c ON c.id = uc.class_id
        GROUP BY u.id, u.username, c.name
        ORDER BY incidents_total DESC, u.username ASC
        LIMIT 5
    """, fetch_all=True)

    return jsonify({
        "metrics": metrics,
        "recent_absences": recent_absences,
        "recent_sanctions": recent_sanctions,
        "top_students": top_students
    }), 200
