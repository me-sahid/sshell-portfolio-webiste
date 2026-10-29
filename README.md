# Sahid Al Hassan — Interactive Linux Terminal Portfolio

A responsive, production-ready personal portfolio website for **Sahid Al Hassan**, built as an authentic, stateful Linux terminal emulator with modern web technologies.

![Terminal Preview](https://img.shields.io/badge/Interface-Linux_Terminal_Emulator-7EE787?style=flat-square&logo=gnubash)
![Stack](https://img.shields.io/badge/Stack-React_19_|_TypeScript_|_Vite_|_Tailwind_CSS_v4-79C0FF?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-25/25_Passing-7EE787?style=flat-square)

---

## 1. Project Overview & Features

- **Genuine Simulated Shell**: Real keyboard input, command dispatching, tokenizing parser, argument/flag validation, and Levenshtein-distance typo suggestions (e.g. `porjects` -> `Did you mean 'projects'?`).
- **In-Memory Virtual Filesystem (VFS)**: Complete `/home/sahid/portfolio` directory structure supporting `ls`, `cd`, `pwd`, and `cat` with relative/absolute paths.
- **Authentic Boot Sequence**: A 2.5-second system boot sequence with skip capability (`Esc`), reduced-motion support (`prefers-reduced-motion`), and session caching so it doesn't replay unnecessarily.
- **Dual Interaction Modes**:
  - **Terminal Mode**: Full command-line navigation (`help`, `whoami`, `about`, `projects`, `project <name>`, `skills`, `education`, `achievements`, `resume`, `contact`, `clear`, `neofetch`, etc.).
  - **GUI Mode**: Accessible one-click section navigation (`~/about`, `~/projects`, `~/skills`, `~/education`, `~/achievements`, `~/resume`, `~/contact`) with a one-key return (`Esc`) to the terminal.
- **100% Resume Fidelity**: Grounded strictly in Sahid's verified resume data without fabricated credentials, ratings, or nonexistent repositories.
- **Verified Resume Asset**: The actual `Sahid_Al_Hassan_Resume.pdf` is bundled and served directly via `resume --view` and `resume --download`.

---

## 2. Directory Structure

```text
terminalPortfolioWeb/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── Sahid_Al_Hassan_Resume.pdf    # Verified resume asset
├── src/
│   ├── components/
│   │   ├── sections/
│   │   │   ├── AboutSection.tsx        # Identity & focus overview
│   │   │   ├── ProjectsSection.tsx     # Zancrypt, Redis-Lite, AllIDo
│   │   │   ├── SkillsSection.tsx       # Tech categories & skills
│   │   │   ├── EducationSection.tsx    # B.Tech & Diploma qualifications
│   │   │   ├── AchievementsSection.tsx # IEEE, Hack2Skill, Academic
│   │   │   ├── ResumeSection.tsx       # PDF view & download actions
│   │   │   └── ContactSection.tsx      # Email, phone, GitHub, LinkedIn
│   │   ├── BootSequence.tsx            # Initial terminal boot animation
│   │   ├── Navigation.tsx              # Section tabs & switcher
│   │   ├── TerminalInput.tsx           # Stateful prompt with history & Tab completion
│   │   ├── TerminalOutput.tsx          # Formatted stream with clickable links
│   │   └── TerminalWindow.tsx          # Responsive window with controls & status
│   ├── data/
│   │   ├── portfolioData.ts            # Single source of truth for resume data
│   │   └── types.ts                    # TypeScript models & types
│   ├── services/
│   │   ├── CommandParser.ts            # Tokenizer, quote handling, chain detection
│   │   ├── CommandRegistry.ts          # Registry, validator, executor, fuzzy matching
│   │   └── VirtualFileSystem.ts        # Virtual in-memory filesystem tree
│   ├── test/
│   │   ├── setup.ts                    # Jest-DOM matchers setup
│   │   └── terminal.test.ts            # Vitest suite covering all 25 test cases
│   ├── App.tsx                         # App wrapper
│   ├── index.css                       # JetBrains Mono font & Tailwind CSS v4
│   └── main.tsx                        # Entry point
├── index.html                          # HTML shell with meta tags & Google fonts
├── vite.config.ts                      # Vite configuration with Tailwind & Vitest
└── tsconfig.json                       # TypeScript configuration
```

---

## 3. Installation & Development

### Prerequisites
- Node.js (v18+ recommended, tested on v22)
- npm (v9+)

### Installation
```bash
# Clone or navigate to the project directory
cd terminalPortfolioWeb

# Install dependencies
npm install
```

### Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 4. Production Build & Deployment

### Build Static Site
```bash
npm run build
```
The optimized static bundle will be generated in the `dist/` directory.

### Preview Production Build Locally
```bash
npm run preview
```

### Deployment
The output in `dist/` is completely static and can be deployed directly to:
- **Cloudflare Pages**
- **Vercel**
- **Netlify**
- **GitHub Pages**

---

## 5. Automated Tests

The test suite covers parser validation, command execution, error recovery, the virtual filesystem, and safety checks against OS command execution.

Run the test suite with:
```bash
npm test
```

### Test Coverage Summary:
- `help` and `help <command>`
- `projects` and `projects --all`
- `project zancrypt`, `project redis-lite`, `project allido`
- Typo suggestions (e.g. `porjects` -> `Did you mean 'projects'?`)
- Argument & option validation (`clear` rejects extra args, `projects --invalid` rejected)
- Virtual filesystem operations (`pwd`, `ls`, `cd`, `cat`, relative paths, `..`)
- Exception containment (deliberate command crashes do not crash the terminal)
- History navigation (Up/Down arrows)
- Tab autocompletion for commands, project names, and filenames
- Command chaining detection (`&&`, `;`, `|` safely rejected)
- Security check (no OS commands or arbitrary execution)

---

## 6. Updating Resume Data or Adding Projects

All resume information is decoupled from the UI inside [`src/data/portfolioData.ts`](file:///c:/Users/sahid/Desktop/terminalPortfolioWeb/src/data/portfolioData.ts):

1. **Update Identity / Contact**: Edit the `IDENTITY` object.
2. **Add / Update Projects**: Add an entry to the `PROJECTS` array. It will automatically reflect in:
   - `projects` and `project <name>` terminal commands
   - Tab completion
   - Virtual filesystem `projects/<name>.txt`
   - GUI `~/projects` section
3. **Add / Update Skills**: Modify the `SKILLS` object categories.
4. **Replace Resume PDF**: Place the updated resume into `public/Sahid_Al_Hassan_Resume.pdf`.
