import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Topic from "../models/Topic.js";

dotenv.config();

const updates = [
  {
    title: "Python Basics",
    concept: "Python syntax, indentation, and basic statements. Python uses indentation to define blocks and is easy to read.",
    explanation: "Python uses indentation to define blocks. Keep code readable and consistent."
  },
  {
    title: "Variables & Types",
    concept: "Variables store values. Common types: int, float, str, bool.",
    explanation: "Use clear names and understand the type of data stored in each variable."
  },
  {
    title: "Input/Output",
    concept: "Read input with input(), print output with print(). Convert types as needed.",
    explanation: "Convert input to the right type before using it in calculations."
  },
  {
    title: "Conditionals",
    concept: "Use if/elif/else to control flow based on conditions.",
    explanation: "Check conditions in order from specific to general."
  },
  {
    title: "Loops",
    concept: "Use for and while loops to repeat actions.",
    explanation: "Choose for loops for fixed iterations and while loops for condition-based repetition."
  },
  {
    title: "Functions",
    concept: "Functions package reusable logic with parameters and return values.",
    explanation: "Keep functions small and focused on one task."
  },
  {
    title: "Strings",
    concept: "Strings are sequences of characters. Use indexing, slicing, and methods.",
    explanation: "Use string methods like .upper(), .lower(), and .strip() for clean text handling."
  },
  {
    title: "Lists",
    concept: "Lists are ordered, mutable collections.",
    explanation: "Lists support indexing, slicing, and methods like append and pop."
  },
  {
    title: "Tuples & Sets",
    concept: "Tuples are immutable sequences; sets store unique elements.",
    explanation: "Use tuples for fixed collections and sets for unique items."
  },
  {
    title: "Dictionaries",
    concept: "Dictionaries map keys to values for fast lookup.",
    explanation: "Use keys to access values quickly, and update with assignment."
  },
  {
    title: "Recursion",
    concept: "A function that calls itself with a base case.",
    explanation: "Always define a clear base case to prevent infinite recursion."
  },
  {
    title: "Sorting Basics",
    concept: "Sort data to enable faster searching or easier processing.",
    explanation: "Use sorted() for a new list or .sort() to modify in place."
  },
  {
    title: "Searching Basics",
    concept: "Linear search checks all items; binary search works on sorted data.",
    explanation: "Binary search requires sorted data; linear search works on any list."
  },
  {
    title: "Two Pointers",
    concept: "Use two indices moving from ends or same direction to solve problems efficiently.",
    explanation: "Two pointers reduce time complexity by scanning once."
  },
  {
    title: "Prefix Sum",
    concept: "Prefix sums allow fast range sum queries.",
    explanation: "Precompute prefix sums once and answer queries in O(1)."
  },
  {
    title: "Stack",
    concept: "Stack is LIFO; use for matching and backtracking.",
    explanation: "Stacks help with problems that require reversing or nested checks."
  },
  {
    title: "Queue",
    concept: "Queue is FIFO; use for BFS and scheduling.",
    explanation: "Queues are useful for processing items in the order they arrive."
  },
  {
    title: "Linked List",
    concept: "Nodes connected by pointers, used for dynamic sequences.",
    explanation: "Linked lists are efficient for insertions and deletions."
  },
  {
    title: "Trees",
    concept: "Hierarchical structure with root and children. Common traversals: inorder, preorder, postorder.",
    explanation: "Tree traversals help visit nodes in a specific order."
  },
  {
    title: "Graphs",
    concept: "Graphs consist of nodes and edges. Use BFS/DFS to traverse.",
    explanation: "Use adjacency lists for sparse graphs and BFS/DFS for traversal."
  }
];

const run = async()=>{
  await connectDB();
  for (const u of updates) {
    await Topic.findOneAndUpdate(
      { title: u.title },
      { concept: u.concept, explanation: u.explanation },
      { new: true }
    );
  }
  console.log("Topic concepts updated");
  process.exit(0);
};

run().catch(err=>{
  console.error(err);
  process.exit(1);
});
