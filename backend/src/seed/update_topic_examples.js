import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Topic from "../models/Topic.js";

dotenv.config();

const updates = [
  {
    title: "Python Basics",
    exampleCode1: "print('Hello')",
    exampleOutput1: "Hello",
    exampleCode2: "if 5 > 2:\n    print('Yes')",
    exampleOutput2: "Yes"
  },
  {
    title: "Variables & Types",
    exampleCode1: "a = 10\nb = 3.5\nprint(a)\nprint(b)",
    exampleOutput1: "10\n3.5",
    exampleCode2: "name = 'Asha'\nis_active = True\nprint(name)\nprint(is_active)",
    exampleOutput2: "Asha\nTrue"
  },
  {
    title: "Input/Output",
    exampleCode1: "name = input()\nprint(name)",
    exampleOutput1: "Input: Asha\nOutput: Asha",
    exampleCode2: "a, b = map(int, input().split())\nprint(a + b)",
    exampleOutput2: "Input: 2 3\nOutput: 5"
  },
  {
    title: "Conditionals",
    exampleCode1: "n = 5\nif n > 0:\n    print('Positive')",
    exampleOutput1: "Positive",
    exampleCode2: "x = -2\nif x == 0:\n    print('Zero')\nelif x < 0:\n    print('Negative')\nelse:\n    print('Positive')",
    exampleOutput2: "Negative"
  },
  {
    title: "Loops",
    exampleCode1: "for i in range(3):\n    print(i)",
    exampleOutput1: "0\n1\n2",
    exampleCode2: "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1",
    exampleOutput2: "3\n2\n1"
  },
  {
    title: "Functions",
    exampleCode1: "def add(a, b):\n    return a + b\n\nprint(add(2, 3))",
    exampleOutput1: "5",
    exampleCode2: "def greet(name):\n    print('Hi', name)\n\ngreet('Asha')",
    exampleOutput2: "Hi Asha"
  },
  {
    title: "Strings",
    exampleCode1: "s = 'hello'\nprint(s[0])",
    exampleOutput1: "h",
    exampleCode2: "print('abc'.upper())",
    exampleOutput2: "ABC"
  },
  {
    title: "Lists",
    exampleCode1: "arr = [1, 2, 3]\narr.append(4)\nprint(arr)",
    exampleOutput1: "[1, 2, 3, 4]",
    exampleCode2: "arr = [1, 2, 3, 4]\nprint(arr[1:3])",
    exampleOutput2: "[2, 3]"
  },
  {
    title: "Tuples & Sets",
    exampleCode1: "t = (1, 2, 3)\nprint(t)",
    exampleOutput1: "(1, 2, 3)",
    exampleCode2: "s = set([1, 1, 2])\nprint(s)",
    exampleOutput2: "{1, 2}"
  },
  {
    title: "Dictionaries",
    exampleCode1: "d = {'a': 1, 'b': 2}\nprint(d['a'])",
    exampleOutput1: "1",
    exampleCode2: "d = {'a': 1}\nd['c'] = 3\nprint(d)",
    exampleOutput2: "{'a': 1, 'c': 3}"
  },
  {
    title: "Recursion",
    exampleCode1: "def fact(n):\n    return 1 if n <= 1 else n * fact(n - 1)\n\nprint(fact(4))",
    exampleOutput1: "24",
    exampleCode2: "def sum_to(n):\n    return 0 if n == 0 else n + sum_to(n - 1)\n\nprint(sum_to(4))",
    exampleOutput2: "10"
  },
  {
    title: "Sorting Basics",
    exampleCode1: "arr = [3, 1, 2]\nprint(sorted(arr))",
    exampleOutput1: "[1, 2, 3]",
    exampleCode2: "words = ['b', 'aa', 'c']\nprint(sorted(words, key=len))",
    exampleOutput2: "['b', 'c', 'aa']"
  },
  {
    title: "Searching Basics",
    exampleCode1: "arr = [4, 2, 7]\ntarget = 7\nfor i, x in enumerate(arr):\n    if x == target:\n        print(i)\n        break",
    exampleOutput1: "2",
    exampleCode2: "import bisect\narr = [1, 3, 5, 7]\ntarget = 5\nidx = bisect.bisect_left(arr, target)\nprint(idx)",
    exampleOutput2: "2"
  },
  {
    title: "Two Pointers",
    exampleCode1: "arr = [1, 2, 3, 4]\nleft, right = 0, len(arr)-1\nprint(arr[left] + arr[right])",
    exampleOutput1: "5",
    exampleCode2: "arr = [1, 1, 2, 2, 3]\nwrite = 1\nfor i in range(1, len(arr)):\n    if arr[i] != arr[write-1]:\n        arr[write] = arr[i]\n        write += 1\nprint(arr[:write])",
    exampleOutput2: "[1, 2, 3]"
  },
  {
    title: "Prefix Sum",
    exampleCode1: "arr = [1, 2, 3]\nps = [0]\nfor x in arr:\n    ps.append(ps[-1] + x)\nprint(ps)",
    exampleOutput1: "[0, 1, 3, 6]",
    exampleCode2: "ps = [0, 1, 3, 6]\nl, r = 1, 3\nprint(ps[r] - ps[l-1])",
    exampleOutput2: "6"
  },
  {
    title: "Stack",
    exampleCode1: "stack = []\nstack.append(1)\nstack.append(2)\nprint(stack.pop())",
    exampleOutput1: "2",
    exampleCode2: "s = \"()\"\nstack = []\nfor ch in s:\n    if ch == '(':\n        stack.append(ch)\n    elif stack:\n        stack.pop()\nprint(len(stack) == 0)",
    exampleOutput2: "True"
  },
  {
    title: "Queue",
    exampleCode1: "from collections import deque\nq = deque()\nq.append(1)\nq.append(2)\nprint(q.popleft())",
    exampleOutput1: "1",
    exampleCode2: "from collections import deque\nq = deque([1, 2, 3])\nq.append(4)\nprint(list(q))",
    exampleOutput2: "[1, 2, 3, 4]"
  },
  {
    title: "Linked List",
    exampleCode1: "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nhead = Node(1)\nhead.next = Node(2)\nprint(head.next.val)",
    exampleOutput1: "2",
    exampleCode2: "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nhead = Node(1)\nhead.next = Node(2)\ncur = head\nwhile cur:\n    print(cur.val)\n    cur = cur.next",
    exampleOutput2: "1\n2"
  },
  {
    title: "Trees",
    exampleCode1: "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\nroot = Node(1)\nroot.left = Node(2)\nroot.right = Node(3)\nprint(root.left.val)",
    exampleOutput1: "2",
    exampleCode2: "def preorder(node):\n    if not node:\n        return\n    print(node.val)\n    preorder(node.left)\n    preorder(node.right)\n\nclass Node:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\nroot = Node(1)\nroot.left = Node(2)\nroot.right = Node(3)\npreorder(root)",
    exampleOutput2: "1\n2\n3"
  },
  {
    title: "Graphs",
    exampleCode1: "n = 3\nG = [[] for _ in range(n)]\nG[0].append(1)\nG[1].append(2)\nprint(G)",
    exampleOutput1: "[[1], [2], []]",
    exampleCode2: "from collections import deque\nG = [[1], [2], []]\nq = deque([0])\nseen = set([0])\nwhile q:\n    cur = q.popleft()\n    for nxt in G[cur]:\n        if nxt not in seen:\n            seen.add(nxt)\n            q.append(nxt)\nprint(sorted(seen))",
    exampleOutput2: "[0, 1, 2]"
  }
];

const run = async()=>{
  await connectDB();
  for (const u of updates) {
    await Topic.findOneAndUpdate(
      { title: u.title },
      {
        exampleCode1: u.exampleCode1,
        exampleOutput1: u.exampleOutput1,
        exampleCode2: u.exampleCode2,
        exampleOutput2: u.exampleOutput2
      },
      { new: true }
    );
  }
  console.log("Topic examples updated");
  process.exit(0);
};

run().catch(err=>{
  console.error(err);
  process.exit(1);
});
