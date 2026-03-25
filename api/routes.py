from flask import Blueprint, request, jsonify, session
import bcrypt
import re
from db import execute_query
from auth import login_required, role_required

api_bp = Blueprint('api_routes', __name__)

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

# ==========================================
# ⚙️ ESPACE ADMINSYS (Configuration & CRUD)
# ==========================================

@api_bp.route('/admin/classes', methods=['GET'])
@login_required
@role_required('admin')
def get_classes():
    classes_list = execute_query("SELECT id, name, level FROM classes ORDER BY name", fetch_all=True)
    return jsonify(classes_list), 200

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
            
        if role not in ['admin', 'professor', 'student', 'staff']:
            return jsonify({"error": "Violation d'intégrité : Rôle inconnu"}), 400
            
        if not re.match(r'^[\w.-]+$', username):
            return jsonify({"error": "Nom d'utilisateur invalide (SQL injection mitigation)"}), 400
            
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        existing = execute_query("SELECT id FROM users WHERE username=%s", (username,), fetch_one=True)
        if existing:
            return jsonify({"error": f"L'utilisateur '{username}' existe déjà."}), 400
            
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

@api_bp.route('/professor/classes', methods=['GET'])
@login_required
@role_required('professor')
def get_prof_classes():
    prof_id = session['user_id']
    query = """
        SELECT c.id, c.name, c.level, s.name as subject
        FROM classes c
        JOIN user_classes uc ON c.id = uc.class_id
        JOIN schedules sch ON sch.class_id = c.id AND sch.professor_id = %s
        JOIN subjects s ON sch.subject_id = s.id
        WHERE uc.user_id = %s
        GROUP BY c.id, s.id
    """
    classes = execute_query(query, (prof_id, prof_id), fetch_all=True)
    return jsonify(classes), 200

@api_bp.route('/professor/students/<int:class_id>', methods=['GET'])
@login_required
@role_required('professor')
def get_prof_students(class_id):
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
    prof_id = session['user_id']
    data = request.get_json()
    student_id = data.get('student_id')
    class_id = data.get('class_id')
    grade = data.get('grade')
    comments = data.get('comments', '')
    
    sub_query = "SELECT subject_id FROM schedules WHERE professor_id = %s AND class_id = %s LIMIT 1"
    sub_res = execute_query(sub_query, (prof_id, class_id), fetch_one=True)
    if not sub_res:
        return jsonify({"error": "Vous n'êtes pas assigné à cette classe."}), 403
        
    subject_id = sub_res['subject_id']
    
    try:
        grade = float(grade)
        if grade < 0 or grade > 20: raise ValueError()
    except:
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
    prof_id = session['user_id']
    data = request.get_json()
    class_id = data.get('class_id')
    date_due = data.get('date_due')
    content = data.get('content')
    
    sub_query = "SELECT subject_id FROM schedules WHERE professor_id = %s AND class_id = %s LIMIT 1"
    sub_res = execute_query(sub_query, (prof_id, class_id), fetch_one=True)
    if not sub_res:
        return jsonify({"error": "Affectation invalide académiquement."}), 403
        
    subject_id = sub_res['subject_id']
    
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
        return jsonify({"error": "L'élève et la date limite de validité sont nécessaires."}), 400
        
    execute_query(
        "INSERT INTO absences (student_id, date, is_late, justified, comments) VALUES (%s, %s, %s, %s, %s)",
        (student_id, date_abs, is_late, justified, comments),
        commit=True
    )
    return jsonify({"message": "Incident comportemental / retard ajouté stricto sensu."}), 201
