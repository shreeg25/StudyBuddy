import json
import os
import hashlib
import getpass

# ---------------- FILES ----------------
ORG_FILE = "org.json"
STUDENT_FILE = "students.json"
EDUCATOR_FILE = "educators.json"

# ---------------- HELPERS ----------------
def load(file):
    if os.path.exists(file):
        with open(file, "r") as f:
            return json.load(f)
    return {}

def save(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)

def hash_pass(p):
    return hashlib.sha256(p.encode()).hexdigest()

# ---------------- PERFORMANCE ----------------
def analyze_marks(marks):
    total = sum(marks.values())
    print("\nSubject-wise Analysis:")
    for sub, m in marks.items():
        if m > 80:
            res = "Very Good"
        elif m > 60:
            res = "Good"
        elif m > 40:
            res = "Average"
        else:
            res = "Needs Improvement"
        print(f"{sub}: {m} → {res}")

    print(f"\nTotal: {total}")
    if total > 230:
        print("Overall Performance: Very Good")
    elif total > 180:
        print("Overall Performance: Good")
    elif total > 120:
        print("Overall Performance: Average")
    else:
        print("Overall Performance: Needs Improvement")

# ---------------- STUDENT ----------------
def student_menu(username):
    students = load(STUDENT_FILE)
    marks = students[username].get("marks", {})

    print("\n--- Student Dashboard ---")
    if not marks:
        print("Marks not uploaded yet.")
        return

    for sub, m in marks.items():
        print(f"{sub}: {m}")

    print(f"Average: {sum(marks.values())/len(marks):.2f}")
    analyze_marks(marks)

# ---------------- EDUCATOR ----------------
def educator_menu(username):
    educators = load(EDUCATOR_FILE)
    students = load(STUDENT_FILE)
    subject = educators[username]["subject"]

    print(f"\n--- Educator Dashboard ({subject}) ---")
    for stu in students:
        mark = int(input(f"Enter marks for {stu}: "))
        students[stu].setdefault("marks", {})[subject] = mark

    save(STUDENT_FILE, students)
    print("Marks uploaded successfully.")

# ---------------- ORG OWNER ----------------
def owner_menu():
    students = load(STUDENT_FILE)
    educators = load(EDUCATOR_FILE)

    while True:
        print("\n1. Add Student\n2. Add Educator\n3. Back")
        ch = input("Choice: ")

        if ch == "1":
            u = input("Student username: ")
            p = hash_pass(getpass.getpass("Password: "))
            students[u] = {"password": p, "marks": {}}
            save(STUDENT_FILE, students)

        elif ch == "2":
            u = input("Educator username: ")
            p = hash_pass(getpass.getpass("Password: "))
            sub = input("Subject: ")
            educators[u] = {"password": p, "subject": sub}
            save(EDUCATOR_FILE, educators)

        else:
            break

# ---------------- LOGIN ----------------
def login(file):
    data = load(file)
    u = input("Username: ")
    p = getpass.getpass("Password: ")

    if u in data and data[u]["password"] == hash_pass(p):
        return u
    print("Invalid credentials")
    return None

# ---------------- MAIN ----------------
def main():
    while True:
        print("\n1. Student Login\n2. Educator Login\n3. Owner Login\n4. Create Org\n5. Exit")
        ch = input("Choice: ")

        if ch == "1":
            u = login(STUDENT_FILE)
            if u: student_menu(u)

        elif ch == "2":
            u = login(EDUCATOR_FILE)
            if u: educator_menu(u)

        elif ch == "3":
            u = login(ORG_FILE)
            if u: owner_menu()

        elif ch == "4":
            org = {
                "owner": {
                    "username": input("Owner username: "),
                    "password": hash_pass(getpass.getpass("Password: "))
                }
            }
            save(ORG_FILE, org)
            print("Organization created.")

        else:
            break

if __name__ == "__main__":
    main()