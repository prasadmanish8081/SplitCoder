import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Topic from "../models/Topic.js";

dotenv.config();

const updates = [
  {
    title: "Python Basics",
    concept: "Python is a high-level language that uses indentation instead of braces. Every block under if/for/while/def must be consistently indented. Statements run top to bottom, and lines matter for control flow.",
    explanation: "Key points:\n- Indentation defines blocks.\n- Use # for comments.\n- One statement per line for clarity.\n\nExample 1:\nif 5 > 2:\n    print('Yes')\n\nExample 2:\n# comment\nprint('Hello')"
  },
  {
    title: "Variables & Types",
    concept: "Variables store data in memory. Python is dynamically typed, so the type is decided by the value. Common types include int, float, str, bool. Use type conversion when mixing input and calculations.",
    explanation: "Key points:\n- int: 3, float: 3.5, str: 'hi', bool: True/False.\n- Use int(), float(), str() to convert.\n\nExample 1:\na = 10\nb = 3.5\n\nExample 2:\nname = 'Asha'\nactive = True"
  },
  {
    title: "Input/Output",
    concept: "Input is read as strings. Convert to numbers before calculations. Output must match exactly, including spaces and newlines.",
    explanation: "Key points:\n- input() returns a string.\n- Use split() for multiple values.\n\nExample 1:\nname = input()\nprint(name)\n\nExample 2:\na,b = map(int,input().split())\nprint(a+b)"
  },
  {
    title: "Conditionals",
    concept: "Conditionals choose which code to run based on a true/false condition. Use if, elif, else. Comparisons include ==, !=, <, >, <=, >=.",
    explanation: "Key points:\n- Conditions must be boolean.\n- elif handles multiple cases.\n\nExample 1:\nif n > 0: print('Positive')\n\nExample 2:\nif x == 0:\n    print('Zero')\nelif x < 0:\n    print('Negative')\nelse:\n    print('Positive')"
  },
  {
    title: "Loops",
    concept: "Loops repeat actions. for is used when range/collection is known; while is used with a condition. Make sure the condition changes to avoid infinite loops.",
    explanation: "Key points:\n- for i in range(n) loops n times.\n- while runs until condition is false.\n\nExample 1:\nfor i in range(3):\n    print(i)\n\nExample 2:\nwhile n > 0:\n    n -= 1"
  },
  {
    title: "Functions",
    concept: "Functions package logic into reusable blocks. They can take parameters and return values. Use them to avoid repetition and improve clarity.",
    explanation: "Key points:\n- def defines a function.\n- return gives back a value.\n\nExample 1:\ndef add(a,b):\n    return a+b\n\nExample 2:\ndef greet(name):\n    print('Hi', name)"
  },
  {
    title: "Strings",
    concept: "Strings are sequences of characters. You can index, slice, and use methods like lower(), upper(), replace(). Strings are immutable.",
    explanation: "Key points:\n- s[0] gives first char.\n- s[a:b] slices.\n\nExample 1:\ns = 'hello'\nprint(s[0])\n\nExample 2:\nprint('abc'.upper())"
  },
  {
    title: "Lists",
    concept: "Lists are ordered and mutable. You can append, remove, and iterate. Indexing starts at 0.",
    explanation: "Key points:\n- append adds to end.\n- slicing creates sublists.\n\nExample 1:\narr = [1,2,3]\narr.append(4)\n\nExample 2:\nprint(arr[1:3])"
  },
  {
    title: "Tuples & Sets",
    concept: "Tuples are ordered and immutable; sets are unordered and store unique values. Use tuples for fixed data and sets for uniqueness.",
    explanation: "Key points:\n- tuple: (1,2,3)\n- set removes duplicates.\n\nExample 1:\nt = (1,2,3)\n\nExample 2:\ns = set([1,1,2])\nprint(s)"
  },
  {
    title: "Dictionaries",
    concept: "Dictionaries map keys to values. Access by key is fast. Keys must be unique and hashable.",
    explanation: "Key points:\n- d[key] to access.\n- d.get(key, default) to avoid errors.\n\nExample 1:\nd = {'a':1, 'b':2}\nprint(d['a'])\n\nExample 2:\nd['c'] = 3"
  },
  {
    title: "Recursion",
    concept: "Recursion solves problems by calling the same function with smaller inputs. Always define a base case to stop.",
    explanation: "Key points:\n- Base case prevents infinite recursion.\n- Each call reduces problem size.\n\nExample 1:\ndef fact(n):\n    return 1 if n<=1 else n*fact(n-1)\n\nExample 2:\ndef sum_to(n):\n    return 0 if n==0 else n+sum_to(n-1)"
  },
  {
    title: "Sorting Basics",
    concept: "Sorting orders data. Python provides sorted() and list.sort(). Sorting helps with searching and grouping.",
    explanation: "Key points:\n- sorted(arr) returns a new list.\n- sort(key=...) customizes order.\n\nExample 1:\narr = [3,1,2]\nprint(sorted(arr))\n\nExample 2:\nwords = ['b','aa','c']\nprint(sorted(words, key=len))"
  },
  {
    title: "Searching Basics",
    concept: "Linear search checks every element; binary search divides the search space and needs sorted data.",
    explanation: "Key points:\n- Linear: O(n).\n- Binary: O(log n).\n\nExample 1:\nfor i,x in enumerate(arr):\n    if x==target: return i\n\nExample 2:\nimport bisect\nidx = bisect.bisect_left(arr, target)"
  },
  {
    title: "Two Pointers",
    concept: "Two pointers reduce time by scanning from ends or using a moving window. Works well on sorted arrays and strings.",
    explanation: "Key points:\n- Move left/right based on condition.\n- Often O(n).\n\nExample 1:\n# pair sum\ni,j=0,n-1\n\nExample 2:\n# remove duplicates\nwrite=1"
  },
  {
    title: "Prefix Sum",
    concept: "Prefix sums precompute cumulative totals so you can answer range queries quickly.",
    explanation: "Key points:\n- ps[i] = sum of first i elements.\n- range(l,r) = ps[r] - ps[l-1].\n\nExample 1:\nps[i] = ps[i-1] + arr[i]\n\nExample 2:\nrange sum = ps[r] - ps[l-1]"
  },
  {
    title: "Stack",
    concept: "Stack is LIFO (last-in, first-out). Useful for matching brackets, undo, and recursion simulation.",
    explanation: "Key points:\n- push: append\n- pop: remove last\n\nExample 1:\nstack.append(x)\nstack.pop()\n\nExample 2:\n# valid parentheses using stack"
  },
  {
    title: "Queue",
    concept: "Queue is FIFO (first-in, first-out). Useful for BFS and scheduling tasks.",
    explanation: "Key points:\n- enqueue: append\n- dequeue: popleft\n\nExample 1:\nfrom collections import deque\nq=deque()\n\nExample 2:\nq.append(x); q.popleft()"
  },
  {
    title: "Linked List",
    concept: "Linked lists store nodes connected by pointers. They allow fast insert/delete at positions but slower indexing.",
    explanation: "Key points:\n- Node has value + next.\n- Traverse with a pointer.\n\nExample 1:\nnode = Node(val)\nnode.next = other\n\nExample 2:\ncur = head\nwhile cur: cur = cur.next"
  },
  {
    title: "Trees",
    concept: "Trees are hierarchical. Binary trees have at most two children. Traversals visit nodes in different orders.",
    explanation: "Key points:\n- Inorder: left, root, right.\n- Preorder: root, left, right.\n\nExample 1:\n# inorder traversal\n\nExample 2:\n# preorder traversal"
  },
  {
    title: "Graphs",
    concept: "Graphs are nodes connected by edges. Use BFS for shortest paths in unweighted graphs and DFS for traversal.",
    explanation: "Key points:\n- Adjacency list stores edges.\n- BFS uses queue; DFS uses stack/recursion.\n\nExample 1:\nG=[[] for _ in range(n)]\n\nExample 2:\nfrom collections import deque\nq=deque([start])"
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
  console.log("Detailed topic concepts updated");
  process.exit(0);
};

run().catch(err=>{
  console.error(err);
  process.exit(1);
});
