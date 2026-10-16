/* =========================================================
   data.js — defaults, stream suggestions, sample resume
   Exposes window.RD (Resume Data helpers)
   ========================================================= */
(function (global) {
  "use strict";

  const COURSES = [
    "B.Sc.- Mathematics",
    "B.Sc.- Physics",
    "B.Sc.- Chemistry",
    "B.Sc.- Medical",
    "B.Sc.- Non-Medical",
    "B.Com (Hons.)",
    "B.Com (Hons.)+CA",
    "BBA (Hons.): Business Analytics",
    "B.A-B.Ed 4 year Integrated",
    "B.Tech. (Hons.) CSE: AI-ML, Data Science, Cyber Security",
    "BCA (Hons.): AI-ML, Data Analytics, Graphic Design & Web Development",
    "Bachelor of Physiotherapy (BPT)",
    "B.A.(Hons.)- Economics",
    "B.A.(Hons.)- Psychology",
    "B.A.(Hons.)- Social Science",
    "B.A.(Hons.)- Punjabi",
    "B.A.(Hons.)- English",
    "B.A.(Hons.)- Liberal Arts (Punjabi Medium)",
    "B.A.(Hons.)- Sri Guru Granth Sahib Studies",
    "M.Sc.(Hons.)- Mathematics",
    "M.Sc.(Hons.)- Physics",
    "M.Sc.(Hons.)- Zoology",
    "M.Sc.(Hons.)- Chemistry",
    "M.Com.(Hons)",
    "M.A.(Hons.)- Economics",
    "M.A.(Hons.)- Psychology",
    "M.A.(Hons.)- History",
    "M.A.(Hons.)- Political Science",
    "M.A.(Hons.)- Punjabi",
    "M.A.(Hons.)- English",
    "Master of Computer Application(MCA)",
    "MBA- Data Analytics",
    "PG Diploma in Guidance and Counselling"
  ];

  const STREAMS = [
    "Computer Science / IT",
    "Electronics / Electrical",
    "Mechanical / Civil Engineering",
    "Commerce / Accounting",
    "Management / Business",
    "Arts / Humanities",
    "Science (PCM/PCB)",
    "Nursing / Healthcare",
    "Education / Teaching",
    "Law",
    "Design / Creative",
    "Other"
  ];

  const CAREER_GOALS = [
    "Software Developer / Engineer",
    "Data Analyst / Data Scientist",
    "UI/UX / Web Developer",
    "Accountant / Finance",
    "Marketing / Sales",
    "HR / Operations",
    "Nurse / Healthcare Professional",
    "Teacher / Educator",
    "Lawyer / Legal Associate",
    "Designer / Creative",
    "Higher Studies / Research",
    "Government / Public Sector",
    "Entrepreneurship",
    "Other"
  ];

  // Per-stream suggestions. Used for objective + skill chips + idea chips.
  const STREAM_DATA = {
    "Computer Science / IT": {
      objective: "Motivated " + COURSES[0] + " student in Computer Science seeking an entry-level software role to apply strong programming, problem-solving and teamwork skills while contributing to real products and continuing to learn modern technologies.",
      skills: ["Java","Python","C++","JavaScript","HTML/CSS","SQL","Data Structures","Git","React","Node.js","Communication","Problem Solving"],
      projects: ["Personal portfolio website","Student result management system","Weather app using a public API","To-do / task manager app"],
      certifications: ["Python for Everybody (Coursera)","Full-Stack Web Development","Google IT Support","AWS Cloud Practitioner"]
    },
    "Electronics / Electrical": {
      objective: "Dedicated Electronics student with hands-on circuit and embedded-systems experience, seeking an opportunity to apply core engineering knowledge and practical skills in a growth-oriented technical team.",
      skills: ["Circuit Design","Embedded C","Arduino","MATLAB","PCB Design","IoT","Problem Solving","Teamwork","Documentation"],
      projects: ["IoT-based home automation","Line-following robot","Arduino weather station","Solar charging system"],
      certifications: ["Embedded Systems","IoT Fundamentals","MATLAB Onramp"]
    },
    "Mechanical / Civil Engineering": {
      objective: "Hardworking engineering student with strong fundamentals and practical workshop exposure, eager to begin a career applying technical design, analysis and problem-solving skills on real projects.",
      skills: ["AutoCAD","SolidWorks","ANSYS","Technical Drawing","MS Excel","Teamwork","Time Management","Site Analysis"],
      projects: ["CAD model of a mechanical assembly","Structural analysis of a small building","Mini fabrication workshop project","Survey and site study"],
      certifications: ["AutoCAD Certification","SolidWorks Associate","Project Management Basics"]
    },
    "Commerce / Accounting": {
      objective: "Detail-oriented Commerce graduate with solid accounting and finance fundamentals, seeking an entry-level role to contribute accurate bookkeeping, analysis and reporting while developing professional expertise.",
      skills: ["Accounting","Tally","MS Excel","GST & Taxation","Financial Analysis","Bookkeeping","Attention to Detail","Communication"],
      projects: ["Financial statement analysis of a company","GST return preparation practice","Budget planning case study","Stock market investment study"],
      certifications: ["Tally ERP","Advanced Excel","GST Practitioner","Financial Modeling"]
    },
    "Management / Business": {
      objective: "Enthusiastic management student with strong communication and organizational skills, seeking an opportunity to support business operations and grow through hands-on learning in a professional environment.",
      skills: ["Communication","Leadership","MS Excel","Presentation","Market Research","MS PowerPoint","Teamwork","Time Management"],
      projects: ["Marketing plan for a product launch","Business model case study","Event management project","Customer survey and analysis"],
      certifications: ["Digital Marketing","Business Communication","Excel for Business"]
    },
    "Arts / Humanities": {
      objective: "Curious and articulate Arts graduate with strong research, writing and communication abilities, seeking a role that values creativity, critical thinking and clear expression.",
      skills: ["Research","Writing","Communication","Critical Thinking","MS Office","Presentation","Editing","Time Management"],
      projects: ["Research paper or dissertation","Content writing portfolio","Community awareness campaign","Translation or editorial work"],
      certifications: ["Content Writing","Digital Marketing","Foreign Language Course"]
    },
    "Science (PCM/PCB)": {
      objective: "Curious Science graduate with strong analytical and laboratory skills, seeking an opportunity to apply scientific knowledge, research methods and attention to detail in a learning-driven role.",
      skills: ["Laboratory Skills","Data Analysis","Research Methods","MS Excel","Report Writing","Attention to Detail","Problem Solving"],
      projects: ["Laboratory research project","Field survey and data study","Statistical analysis report","Science exhibition project"],
      certifications: ["Lab Safety","Data Analysis","Research Methodology"]
    },
    "Nursing / Healthcare": {
      objective: "Compassionate nursing student with strong clinical fundamentals and patient-care training, seeking a role to deliver safe, empathetic care while continuing to develop clinical expertise.",
      skills: ["Patient Care","Clinical Skills","Vitals Monitoring","Infection Control","Communication","Empathy","Teamwork","Record Keeping"],
      projects: ["Clinical rotation case study","Community health awareness drive","Patient care documentation project","Health camp volunteering"],
      certifications: ["Basic Life Support (BLS)","First Aid","Infection Control Training"]
    },
    "Education / Teaching": {
      objective: "Passionate education student with strong subject knowledge and classroom practice, seeking a teaching role to inspire students through clear communication, patience and creative lesson planning.",
      skills: ["Lesson Planning","Classroom Management","Communication","Subject Expertise","Patience","Creativity","MS Office"],
      projects: ["Teaching practice / internship","Micro-teaching session","Educational aid design","Student assessment project"],
      certifications: ["CTET / TET","Educational Technology","Child Psychology"]
    },
    "Law": {
      objective: "Detail-oriented law student with strong research, drafting and analytical skills, seeking a legal internship or associate role to contribute to case research and documentation while building practical expertise.",
      skills: ["Legal Research","Drafting","Case Analysis","Communication","Argumentation","MS Office","Attention to Detail"],
      projects: ["Moot court participation","Legal research paper","Internship case summaries","Legal aid clinic volunteering"],
      certifications: ["Legal Research","Contract Drafting","IP Law Basics"]
    },
    "Design / Creative": {
      objective: "Creative design student with a strong portfolio and eye for detail, seeking a junior design role to craft clean, user-focused visuals while growing with a collaborative creative team.",
      skills: ["Figma","Adobe Photoshop","Illustrator","Typography","UI Design","Creativity","Prototyping","Communication"],
      projects: ["App UI redesign concept","Brand identity for a startup","Poster / campaign series","Portfolio website design"],
      certifications: ["UI/UX Design","Graphic Design","Adobe Certified Professional"]
    },
    "Other": {
      objective: "Motivated and hardworking student seeking an opportunity to apply my academic knowledge, willingness to learn and strong work ethic in a professional, growth-oriented role.",
      skills: ["Communication","Teamwork","MS Office","Time Management","Problem Solving","Adaptability","Willingness to Learn"],
      projects: ["Academic capstone project","Volunteer / community work","Part-time job responsibilities","Personal learning project"],
      certifications: ["Computer Basics","Communication Skills","Any relevant short course"]
    }
  };

  function uid() { return "id" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

  function blankResume() {
    return {
      template: "ats",
      accent: "#1e3a8a",
      personal: { fullName: "", phone: "", email: "", location: "", linkedin: "", portfolio: "", course: "", stream: "", careerGoal: "", objective: "" },
      education: [],
      skills: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: [],
      activities: [],
      languages: [],
      interests: [],
      customSections: [],
      sectionOrder: ["objective","education","skills","experience","projects","certifications","achievements","activities","languages","interests"],
      meta: { updatedAt: null }
    };
  }

  // Section registry: key -> { label, inOrder }
  const SECTIONS = [
    { key: "objective",      label: "Career Objective" },
    { key: "education",      label: "Education" },
    { key: "skills",         label: "Skills" },
    { key: "experience",     label: "Experience & Internships" },
    { key: "projects",       label: "Projects & Practical Work" },
    { key: "certifications", label: "Certifications" },
    { key: "achievements",   label: "Achievements" },
    { key: "activities",     label: "Activities & Responsibilities" },
    { key: "languages",      label: "Languages" },
    { key: "interests",      label: "Interests" }
  ];

  // Does a section have any content? (drives auto-hide + checklist)
  function sectionHasContent(data, key) {
    switch (key) {
      case "objective": return !!(data.personal.objective || "").trim();
      case "education": return data.education.length > 0;
      case "skills": return data.skills.length > 0;
      case "experience": return data.experience.length > 0;
      case "projects": return data.projects.length > 0;
      case "certifications": return data.certifications.length > 0;
      case "achievements": return data.achievements.length > 0;
      case "activities": return data.activities.length > 0;
      case "languages": return data.languages.length > 0;
      case "interests": return data.interests.length > 0;
      default:
        if (key.indexOf("custom:") === 0) {
          const id = key.slice(7);
          const c = data.customSections.find(function (x) { return x.id === id; });
          return !!(c && c.title && c.items && c.items.length);
        }
        return false;
    }
  }

  function sampleResume() {
    const d = blankResume();
    d.template = "modern";
    d.accent = "#1e3a8a";
    d.personal = {
      fullName: "Dipanshu",
      phone: "+91-9756938892",
      email: "dipanshu150206@gmail.com",
      location: "",
      linkedin: "linkedin.com/in/dipanshu-27b976288",
      portfolio: "https://dipanshu.free.je/",
      course: "B.Tech (Hons.)",
      stream: "Computer Science / IT",
      careerGoal: "Software Developer / Engineer",
      objective: "Full stack developer and B.Tech (Hons.) Data Science student (CGPA 8.36) who builds complete web applications end to end, from MySQL schema and REST APIs to responsive Bootstrap front ends.\nShipped four role-based systems, including a production Employee Leave Management System during a software internship.\nPairs web development with a data science toolkit in Python, Pandas, Scikit-learn and Power BI, and has presented a research paper at CISTM-2025.\nSeeking entry-level Full Stack Developer, Software Engineer or Data Analyst roles."
    };
    d.education = [
      { id: uid(), degree: "B.Tech (Hons.), Data Science", institution: "Akal University, Talwandi Sabo", board: "Akal University", startYear: "2023", endYear: "2027", scoreType: "CGPA/10", score: "8.36" }
    ];
    d.skills = ["HTML5","CSS3","JavaScript","Bootstrap 5","PHP","CodeIgniter 4","Python","Flask","REST API","MySQL","SQL","NumPy","Pandas","Matplotlib","Scikit-learn","OpenPyXL","Power BI","Excel","Git","GitHub","DSA","OOP","Java","C++","C","Figma","DBMS","VS Code"];
    d.experience = [
      { id: uid(), role: "Software Development Intern", company: "Katebaa Rural Services & Solution Foundation", type: "Internship", location: "Mohali", startDate: "Jun 2026", endDate: "Jul 2026", current: false, description: "Built an Employee Leave Management System (ELMS) end to end, covering database design, backend logic and a responsive admin interface.\nImplemented secure employee login, leave application, multi-level approval workflow, department management and an admin dashboard.\nDesigned the MySQL schema and wrote CRUD operations for employees, departments and leave records in the CodeIgniter 4 MVC structure.\nDebugged and tested all core workflows before hand-over, working to the organisation's requirements.\nTech: PHP, CodeIgniter 4, MySQL, Bootstrap 5." },
      { id: uid(), role: "Training & Placement Coordinator", company: "Akal University, Talwandi Sabo", type: "Part-time", location: "Talwandi Sabo", startDate: "Jan 2026", endDate: "May 2026", current: false, description: "Coordinated training and placement activities for students in collaboration with the Training & Placement Cell.\nAssisted in organizing placement drives, recruitment activities, and student registration processes.\nCoordinated communication between students, faculty members, and recruiters.\nMaintained and managed placement-related student records and information.\nSupported the planning and execution of training sessions, career activities, and placement events." }
    ];
    d.projects = [
      { id: uid(), title: "Placement Management System", techstack: "PHP, CodeIgniter 4, MySQL, REST API, Bootstrap 5", link: "https://github.com/dipanshu1502", description: "Built a full stack platform that digitises the campus placement process for students and administrators.\nDesigned REST APIs consumed by both the web and mobile clients, keeping one backend for two front ends.\nImplemented student profiles, placement drives, job applications, resume uploads and secure authentication.\nTested every major workflow across web and mobile before release." },
      { id: uid(), title: "Seating Planner - Data Automation Tool", techstack: "Python, Flask, Pandas, OpenPyXL", link: "https://github.com/dipanshu1502", description: "Automated exam-hall seating by reading student and room data from Excel, processing it with Pandas and exporting allocation sheets.\nReplaced a manual allocation process, reducing errors and preparation time for examination staff.\nServed the tool through a Flask web interface so non-technical staff can generate plans." },
      { id: uid(), title: "Club Management System", techstack: "PHP, MySQL, Bootstrap 5, JavaScript", link: "https://github.com/dipanshu1502", description: "Built a role-based portal for college clubs, members and events with separate admin, coordinator and student access.\nAutomated event creation, approval and participation workflows to improve coordination between clubs and faculty." }
    ];
    d.certifications = [
      { id: uid(), name: "Ethical AI and Retrieval-Augmented Generation (RAG)", issuer: "", date: "2025", credentialLink: "" },
      { id: uid(), name: "Python, C and C++", issuer: "IIT Bombay", date: "", credentialLink: "" },
      { id: uid(), name: "Python", issuer: "Reliance Foundation", date: "", credentialLink: "" }
    ];
    d.achievements = [
      { id: uid(), title: "Research paper presented at CISTM-2025", description: "Presented a research paper at CISTM-2025 (international conference).", date: "2025" },
      { id: uid(), title: "Led CodeForge Coding Club", description: "Led CodeForge Coding Club; organised coding contests, workshops and technical events.", date: "" },
      { id: uid(), title: "Designed Souvenir and Abstract Book for IEEE CI2A-2026", description: "Designed the official Souvenir and Abstract Book for the IEEE CI2A-2026 Conference.", date: "2026" }
    ];
    d.activities = [
      { id: uid(), title: "Class Representative", description: "Coordinating between students and faculty." }
    ];
    d.languages = [];
    d.interests = [];
    d.meta = { updatedAt: new Date().toISOString() };
    return d;
  }

  global.RD = {
    uid: uid,
    COURSES: COURSES,
    STREAMS: STREAMS,
    CAREER_GOALS: CAREER_GOALS,
    STREAM_DATA: STREAM_DATA,
    SECTIONS: SECTIONS,
    blankResume: blankResume,
    sampleResume: sampleResume,
    sectionHasContent: sectionHasContent
  };
})(window);
