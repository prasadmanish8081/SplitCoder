import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Tutorial from "../models/Tutorial.js";

dotenv.config();

const quiz = [
  {
    question: "Which function is used to print output in Python?",
    options: ["echo()", "print()", "show()", "write()"],
    correctIndex: 1,
    explanation: "print() is the standard output function."
  },
  {
    question: "How do you write a comment in Python?",
    options: ["// comment", "# comment", "<!-- comment -->", "/* comment */"],
    correctIndex: 1,
    explanation: "Python uses # for single-line comments."
  },
  {
    question: "Which of these is a valid variable name?",
    options: ["2name", "first-name", "first_name", "first name"],
    correctIndex: 2,
    explanation: "Underscores are allowed; names cannot start with a digit."
  },
  {
    question: "What is the output of: print(2 + 3 * 2)?",
    options: ["10", "7", "8", "12"],
    correctIndex: 1,
    explanation: "Multiplication happens before addition."
  },
  {
    question: "Which type does input() return by default?",
    options: ["int", "float", "str", "bool"],
    correctIndex: 2,
    explanation: "input() always returns a string."
  },
  {
    question: "What is the correct way to define a function?",
    options: ["function add(a,b):", "def add(a, b):", "fun add(a,b):", "define add(a,b):"],
    correctIndex: 1,
    explanation: "Python uses def to define functions."
  },
  {
    question: "Which operator is used for exponentiation?",
    options: ["^", "**", "%", "//"],
    correctIndex: 1,
    explanation: "** is exponentiation in Python."
  },
  {
    question: "What is the output of: print('5' + '3')?",
    options: ["8", "53", "5 3", "Error"],
    correctIndex: 1,
    explanation: "Strings are concatenated."
  },
  {
    question: "Which keyword starts a conditional in Python?",
    options: ["when", "if", "then", "case"],
    correctIndex: 1,
    explanation: "if starts a conditional statement."
  },
  {
    question: "Which of these is a boolean value in Python?",
    options: ["TRUE", "True", "true", "yes"],
    correctIndex: 1,
    explanation: "Python booleans are True/False."
  }
];

const problems = [
  {
    title: "Hello World",
    statement: "Print Hello World.",
    expectedOutput: "Hello World",
    hint: "Use print().",
    solution: "print('Hello World')",
    hiddenTestcases: "[]",
    sampleInput: "",
    sampleOutput: "Hello World",
    rulesConstraints: "",
    difficulty: "easy",
    order: 1
  },
  {
    title: "Sum Two Numbers",
    statement: "Read two integers and print their sum.",
    expectedOutput: "7",
    hint: "Add a and b.",
    solution: "a,b=map(int,input().split())\nprint(a+b)",
    hiddenTestcases: "[]",
    sampleInput: "3 4",
    sampleOutput: "7",
    rulesConstraints: "",
    difficulty: "easy",
    order: 2
  }
];

const run = async () => {
  await connectDB();

  let tutorial = await Tutorial.findOne({ order: 1 });
  if (!tutorial) {
    tutorial = await Tutorial.findOne().sort({ order: 1, createdAt: 1 });
  }

  if (!tutorial) {
    console.error("No tutorials found. Add a tutorial first.");
    process.exit(1);
  }

  tutorial.quiz = quiz;
  tutorial.problems = problems;
  await tutorial.save();

  console.log(`Seeded quiz + problems for tutorial: ${tutorial.title}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
