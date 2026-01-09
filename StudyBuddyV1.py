import os
import time
import sys
import random

# --- CONFIGURATION & THEME ---
# Theme: Professional Academic (Deep Blue, Clean White, Cyan Accents)
# Simulating the visual identity of the "StudyBuddy" logo.

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'      # Primary Brand Color
    CYAN = '\033[96m'      # Accents / AI Features
    GREEN = '\033[92m'     # Success / High Grades
    YELLOW = '\033[93m'    # Warnings / Pending Requests
    RED = '\033[91m'       # Exit / Low Grades
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    GREY = '\033[90m'
    END = '\033[0m'
    # Added missing colors causing AttributeError
    BG_BLUE = '\033[44m'
    WHITE = '\033[97m'

# --- UTILITIES ---

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(title, subtitle=""):
    clear_screen()
    print(f"{Colors.BLUE}{Colors.BOLD}" + "="*70)
    print(f"{'STUDY BUDDY'.center(70)}")
    print("="*70 + f"{Colors.END}")
    if title:
        print(f"\n{Colors.CYAN}{Colors.BOLD}>> {title.upper()}{Colors.END}")
    if subtitle:
        print(f"{Colors.GREY}{subtitle}{Colors.END}")
    print("-" * 70)

def loading_spinner(text="Processing", duration=1.5):
    """Simulates backend processing time"""
    chars = "|/-\\"
    for i in range(int(duration * 10)):
        sys.stdout.write(f"\r{Colors.CYAN}{text}... {chars[i % 4]}{Colors.END}")
        sys.stdout.flush()
        time.sleep(0.1)
    sys.stdout.write("\r" + " "*(len(text)+5) + "\r") # Clear line

def press_enter():
    input(f"\n{Colors.GREY}Press [Enter] to continue...{Colors.END}")

# --- SECTIONS BASED ON SLIDES 9-11 (MAINPAGE) ---

def main_app():
    while True:
        # Slide 11: Real time showcase of no. of educators/students
        users_online = random.randint(120, 150)
        
        print_header("Main Menu", f"Live Stats: {users_online} Users Online | 12 Organisations Joined")
        
        # Menu based on Slide 10: Home, FAQs, About us, Sign Up/Login, Contact
        print(f" {Colors.BOLD}1.{Colors.END} Home / Why Join Us?")
        print(f" {Colors.BOLD}2.{Colors.END} FAQs")
        print(f" {Colors.BOLD}3.{Colors.END} About Us")
        print(f" {Colors.BOLD}4.{Colors.END} Sign Up / Login")
        print(f" {Colors.BOLD}5.{Colors.END} Contact Us")
        print(f" {Colors.BOLD}6.{Colors.END} AI Chatbot Helper (Beta)")
        print(f" {Colors.BOLD}0.{Colors.END} {Colors.RED}Exit{Colors.END}")
        
        choice = input(f"\n{Colors.BLUE}Select Option > {Colors.END}")

        if choice == '1':
            show_why_join_us()
        elif choice == '2':
            show_faqs()
        elif choice == '3':
            show_about_us()
        elif choice == '4':
            login_portal()
        elif choice == '5':
            print(f"\n{Colors.CYAN}Contact Support:{Colors.END} support@studybuddy.edu")
            press_enter()
        elif choice == '6':
            chatbot_preview()
        elif choice == '0':
            print(f"\n{Colors.BLUE}Thank you for using StudyBuddy. Keep learning!{Colors.END}")
            sys.exit()
        else:
            print(f"{Colors.RED}Invalid selection.{Colors.END}")
            time.sleep(0.5)

def show_why_join_us():
    print_header("Why Join Us?")
    # Slide 4 content
    print(f"{Colors.GREEN}✓{Colors.END} 40-50% less time for teacher reporting")
    print(f"{Colors.GREEN}✓{Colors.END} Early identification of at-risk students")
    print(f"{Colors.GREEN}✓{Colors.END} Personalized AI recommendations")
    press_enter()

def show_faqs():
    print_header("Frequently Asked Questions")
    print(f"{Colors.BOLD}Q: Is this free?{Colors.END}")
    print("A: Yes, it is an open-source solution.\n")
    print(f"{Colors.BOLD}Q: Who is it for?{Colors.END}")
    print("A: Students, Educators, and Institute Heads preparing for competitive exams.")
    press_enter()

def show_about_us():
    print_header("About Us")
    # Slide 1 content
    print(f"{Colors.BOLD}Team Lowkey{Colors.END} | IIIT Sri City")
    print("Mission: To solve student depression linked to poor performance by providing direction.")
    press_enter()

def chatbot_preview():
    # Slide 11 mentions "Chatbot"
    print_header("AI Assistant")
    print(f"{Colors.CYAN}Bot:{Colors.END} Hello! I can help you navigate StudyBuddy. What are you looking for?")
    input(f"{Colors.YELLOW}You:{Colors.END} ")
    print(f"{Colors.CYAN}Bot:{Colors.END} To access that, please Login first via Option 4.")
    press_enter()

# --- LOGIN PORTAL (Slide 11) ---

def login_portal():
    print_header("Login", "Select your role")
    print(f" 1. Login as {Colors.GREEN}Student{Colors.END}")
    print(f" 2. Login as {Colors.CYAN}Educator{Colors.END}")
    print(f" 3. Login as {Colors.YELLOW}Owner/Creator{Colors.END}")
    print(f" 4. Back")

    role = input(f"\n{Colors.BLUE}Role Selection > {Colors.END}")

    if role == '1':
        dashboard_student()
    elif role == '2':
        dashboard_educator()
    elif role == '3':
        dashboard_creator()

# --- STUDENT DASHBOARD (Slides 12-14) ---

def dashboard_student():
    loading_spinner("Loading Student Profile")
    while True:
        # Header based on Slide 13 (Krish, 12, PCM)
        print_header("Student Dashboard", "User: Krish | Class: 12 | Stream: PCM | Org: IIIT_Sri_City")
        
        # Features based on Slide 14
        print(f"{Colors.BOLD}--- Resources & Tools ---{Colors.END}")
        print(f" 1. {Colors.CYAN}AI Performance Analysis{Colors.END} (Test Results)")
        print(f" 2. {Colors.CYAN}Smart Resources{Colors.END} (Personalised Suggestions)")
        print(f" 3. {Colors.CYAN}Chat Section{Colors.END} (Ask Questions)")
        print(f" 4. {Colors.CYAN}Flashcards / Summarise PDF{Colors.END}")
        print(f" 5. {Colors.RED}Logout{Colors.END}")

        choice = input(f"\n{Colors.GREEN}Action > {Colors.END}")

        if choice == '1':
            print(f"\n{Colors.BOLD}Recent Test Results:{Colors.END}")
            print(f"Mathematics: {Colors.GREEN}92/100{Colors.END} (Excellent)")
            print(f"Physics:     {Colors.RED}55/100{Colors.END} (Weak Area: Thermodynamics)")
            print(f"\n{Colors.CYAN}AI Insight:{Colors.END} You need more practice in Physics formulas.")
            press_enter()
        elif choice == '2':
            # Slide 14: Upload own resources / Get suggestions
            print(f"\n{Colors.BOLD}AI Suggested Resources for 'Physics':{Colors.END}")
            print("1. Video: Laws of Thermodynamics (Khan Academy)")
            print("2. PDF: Chapter 4 Summary Notes")
            print("3. [Upload your own resource for analysis]")
            press_enter()
        elif choice == '3':
            print(f"\n{Colors.BOLD}Chat Section:{Colors.END}")
            print("Connect with mentors or use the AI tutor.")
            input(f"{Colors.YELLOW}Type your question:{Colors.END} ")
            print(f"{Colors.CYAN}AI:{Colors.END} Here is a breakdown of that concept...")
            press_enter()
        elif choice == '4':
            print("\nGenerating Flashcards from 'History_Unit_1.pdf'...")
            loading_spinner("Summarizing")
            print(f"\n{Colors.GREEN}Summary Ready!{Colors.END} 5 Key points extracted.")
            press_enter()
        elif choice == '5':
            break

# --- EDUCATOR DASHBOARD (Slides 15-16) ---

def dashboard_educator():
    loading_spinner("Authenticating Educator")
    while True:
        # Header based on Slide 16 (Narayan, School_Coaching_name)
        print_header("Educator Dashboard", "User: Narayan | Dept: PCM | Org: School_Coaching_name")
        
        # Features based on Slide 16
        print(f" 1. {Colors.BLUE}View Students Performance{Colors.END}")
        print(f" 2. {Colors.BLUE}Give Suggestions / Feedback{Colors.END}")
        print(f" 3. {Colors.BLUE}Connect with Students{Colors.END}")
        print(f" 4. {Colors.BLUE}My Profile{Colors.END}")
        print(f" 5. {Colors.RED}Logout{Colors.END}")

        choice = input(f"\n{Colors.CYAN}Action > {Colors.END}")

        if choice == '1':
            print(f"\n{Colors.BOLD}Class Performance Matrix:{Colors.END}")
            print("1. Krish (12 PCM) - Avg: 78% [Needs help in Physics]")
            print("2. Shree (12 PCM) - Avg: 88% [Consistent]")
            press_enter()
        elif choice == '2':
            print("\nSelect Student to nudge:")
            print("1. Krish")
            input("Enter Message: ")
            print(f"{Colors.GREEN}Feedback sent successfully!{Colors.END}")
            press_enter()
        elif choice == '5':
            break

# --- CREATOR DASHBOARD (Slides 17-19) ---

def dashboard_creator():
    loading_spinner("Accessing Admin Console")
    # Simulation of pending requests state
    pending_requests = [{"name": "Krish", "stream": "PCM", "role": "Student"}]

    while True:
        # Header based on Slide 18 (Laxmi, LS01)
        req_count = len(pending_requests)
        alert_color = Colors.RED if req_count > 0 else Colors.GREY
        
        print_header("Creator Dashboard", f"User: Laxmi (Owner) | Org ID: LS01 | {alert_color}{req_count} Pending Requests{Colors.END}")
        
        # Features based on Slide 18/19
        print(f" 1. {Colors.YELLOW}Joining Requests ({req_count}){Colors.END}")
        print(f" 2. {Colors.YELLOW}Creator's Profile{Colors.END}")
        print(f" 3. {Colors.RED}Logout{Colors.END}")

        choice = input(f"\n{Colors.YELLOW}Action > {Colors.END}")

        if choice == '1':
            # Slide 19: Joining Requests UI
            if not pending_requests:
                print("\nNo pending requests.")
                press_enter()
                continue
                
            print(f"\n{Colors.BOLD}--- Pending Requests ---{Colors.END}")
            for idx, req in enumerate(pending_requests):
                print(f"{idx+1}. Name: {req['name']} | Stream: {req['stream']} | Role: {req['role']}")
            
            action = input(f"\n{Colors.BOLD}[A]ccept All  [R]eject All  [B]ack :{Colors.END} ").upper()
            
            if action == 'A':
                loading_spinner("Adding Students to Database")
                print(f"\n{Colors.GREEN}Success! Krish has been added to the organisation.{Colors.END}")
                pending_requests = [] # Clear requests
                press_enter()
            elif action == 'R':
                print("Requests rejected.")
                pending_requests = []
                press_enter()

        elif choice == '3':
            break

if __name__ == "__main__":
    try:
        main_app()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}Force Exit.{Colors.END}")