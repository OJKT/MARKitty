# BriefGEN

A Next.js application for generating personalized DOCX files from a template by replacing placeholder text with student names.

## Features

- Upload DOCX template containing "Your Name" placeholder
- Upload CSV or text file with student names (one per line)
- Enter assignment reference code
- Generate individual DOCX files for each student
- Download all files in a ZIP archive

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Prepare your DOCX template:
   - Create a DOCX file with "Your Name" as a placeholder where student names should appear
   - Save the template (e.g., "Template-EPH2.docx")

2. Prepare your student name list:
   - Create a text file (.txt) or CSV file
   - Add one student name per line in "Firstname Lastname" format
   - Save the list

3. Generate files:
   - Upload your DOCX template
   - Upload your student name list
   - Enter the assignment reference code (e.g., "EPH2")
   - Click "Generate Files"
   - Download the ZIP file containing all generated documents

## File Naming

Generated files follow the pattern: `Firstname Lastname - REF_CODE.docx`

Example: `John Smith - EPH2.docx`

## Placeholder Detection Branch

This branch focuses on improving the robustness of placeholder detection. The objective is to ensure placeholders in textboxes, headers, footers, and tables are all correctly identified and replaced, even in complex DOCX structures. 