/*
  IGCSEMYSG RESOURCE CATALOGUE
  Add, edit, hide and arrange resources here.
  See RESOURCE-MANAGEMENT-GUIDE.txt for full instructions.
*/

window.IGCSEMYSG_SUBJECTS = [
  "Mathematics", "Additional Mathematics", "Physics", "Chemistry", "Biology",
  "Accounting", "Economics", "Business", "Geography", "English First Language",
  "English Second Language", "ICT", "Computer Science", "Commerce", "Sociology",
  "Global Perspectives", "Environmental Management"
];

window.IGCSEMYSG_RESOURCE_TYPES = [
  "Revision notes", "Topical questions", "Past paper", "Mark scheme",
  "Model answer", "Formula sheet", "Exam guide", "Textbook link"
];

window.IGCSEMYSG_EXAM_BOARDS = [
  "Cambridge IGCSE", "Pearson Edexcel International GCSE",
  "Singapore O-Level", "Multiple boards"
];

/*
  Paste resource objects between the brackets. Example:

  {
    id: "mathematics-linear-equations-notes",
    title: "Linear equations revision notes",
    subject: "Mathematics",
    type: "Revision notes",
    board: "Cambridge IGCSE",
    syllabusCode: "0580",
    topics: ["Algebra", "Linear equations"],
    level: "Year 10–11",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
    description: "Concise notes covering methods, worked examples and common errors.",
    url: "resources/mathematics/linear-equations-notes.pdf",
    fileSize: "1.8 MB",
    featured: true,
    published: true,
    order: 1
  }
*/
window.IGCSEMYSG_RESOURCES = [];
