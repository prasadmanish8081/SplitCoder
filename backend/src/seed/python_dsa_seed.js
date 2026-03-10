import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Topic from "../models/Topic.js";
import Problem from "../models/Problem.js";

dotenv.config();

const topics = [
  { title: "Python Basics", concept: "Syntax, indentation, comments, expressions.", explanation: "Learn syntax rules and basic structure.", order: 1 },
  { title: "Variables & Types", concept: "Variables, numbers, strings, booleans.", explanation: "Store and use different data types.", order: 2 },
  { title: "Input/Output", concept: "Read input and print output.", explanation: "Use input() and print() correctly.", order: 3 },
  { title: "Conditionals", concept: "if/elif/else.", explanation: "Make decisions based on conditions.", order: 4 },
  { title: "Loops", concept: "for/while loops.", explanation: "Repeat actions and iterate.", order: 5 },
  { title: "Functions", concept: "Define and call functions.", explanation: "Break problems into reusable parts.", order: 6 },
  { title: "Strings", concept: "String operations.", explanation: "Work with text and formatting.", order: 7 },
  { title: "Lists", concept: "List operations.", explanation: "Store ordered data and manipulate.", order: 8 },
  { title: "Tuples & Sets", concept: "Tuples and sets.", explanation: "Immutable sequences and uniqueness.", order: 9 },
  { title: "Dictionaries", concept: "Key-value mapping.", explanation: "Fast lookup and counts.", order: 10 },
  { title: "Recursion", concept: "Recursive functions.", explanation: "Solve with base + smaller cases.", order: 11 },
  { title: "Sorting Basics", concept: "Sorting lists.", explanation: "Sort data with keys.", order: 12 },
  { title: "Searching Basics", concept: "Linear and binary search.", explanation: "Find items efficiently.", order: 13 },
  { title: "Two Pointers", concept: "Two pointer technique.", explanation: "Efficient array/string scans.", order: 14 },
  { title: "Prefix Sum", concept: "Prefix sums.", explanation: "Answer range queries fast.", order: 15 },
  { title: "Stack", concept: "LIFO stack.", explanation: "Use stack for matching/history.", order: 16 },
  { title: "Queue", concept: "FIFO queue.", explanation: "Process in arrival order.", order: 17 },
  { title: "Linked List", concept: "Nodes and pointers.", explanation: "Basic list operations.", order: 18 },
  { title: "Trees", concept: "Tree traversals.", explanation: "Hierarchical structures.", order: 19 },
  { title: "Graphs", concept: "BFS/DFS.", explanation: "Traverse graphs.", order: 20 }
];

const P = (topicTitle, order, title, statement, sampleInput, sampleOutput, expectedOutput, hint, solution, difficulty, hiddenTestcases = "") => ({
  topicTitle, order, title, statement, sampleInput, sampleOutput, expectedOutput, hint, solution, difficulty,
  rulesConstraints: "",
  hiddenTestcases: hiddenTestcases || "[]"
});

const problems = [
  // Python Basics
  P("Python Basics", 1, "Hello World", "Print Hello World.", "", "Hello World", "Hello World", "Use print().", "print('Hello World')", "easy", "[{\"input\":\"\",\"output\":\"Hello World\"}]"),
  P("Python Basics", 2, "Print 42", "Print the number 42.", "", "42", "42", "Use print(42).", "print(42)", "easy", "[{\"input\":\"\",\"output\":\"42\"}]"),
  P("Python Basics", 3, "Two Lines", "Print A and B on new lines.", "", "A\nB", "A\nB", "Use two prints.", "print('A')\nprint('B')", "easy"),
  P("Python Basics", 4, "Sum Two", "Read two integers and print sum.", "3 4", "7", "7", "Add a+b.", "a,b=map(int,input().split())\nprint(a+b)", "easy", "[{\"input\":\"5 6\",\"output\":\"11\"}]"),
  P("Python Basics", 5, "Square", "Read n and print n^2.", "5", "25", "25", "Use n*n.", "n=int(input())\nprint(n*n)", "easy", "[{\"input\":\"9\",\"output\":\"81\"}]"),

  // Variables & Types
  P("Variables & Types", 1, "Sum Integers", "Read two ints and print sum.", "7 8", "15", "15", "Convert to int.", "a,b=map(int,input().split())\nprint(a+b)", "easy"),
  P("Variables & Types", 2, "Concat", "Read two words and print concatenation.", "hello World", "helloWorld", "helloWorld", "Use +.", "a,b=input().split()\nprint(a+b)", "easy"),
  P("Variables & Types", 3, "Even Check", "Print True if even else False.", "4", "True", "True", "n%2==0.", "n=int(input())\nprint(n%2==0)", "easy"),
  P("Variables & Types", 4, "Swap", "Swap two numbers.", "1 2", "2 1", "2 1", "Tuple swap.", "a,b=map(int,input().split())\nprint(b,a)", "easy"),
  P("Variables & Types", 5, "Average", "Print average with 2 decimals.", "3 4", "3.50", "3.50", "Use format.", "a,b=map(float,input().split())\nprint(f\"{(a+b)/2:.2f}\")", "medium"),

  // Input/Output
  P("Input/Output", 1, "Echo", "Read a line and print it.", "hello", "hello", "hello", "Use input().", "print(input())", "easy"),
  P("Input/Output", 2, "Sum Three", "Read three ints and print sum.", "1 2 3", "6", "6", "Split input.", "a,b,c=map(int,input().split())\nprint(a+b+c)", "easy"),
  P("Input/Output", 3, "Two Lines", "Read two lines, print with space.", "Hello\nWorld", "Hello World", "Hello World", "Two input() calls.", "a=input()\nb=input()\nprint(a,b)", "easy"),
  P("Input/Output", 4, "Comma Output", "Print two numbers separated by comma.", "3 4", "3,4", "3,4", "Use sep.", "a,b=input().split()\nprint(a,b,sep=',')", "easy"),
  P("Input/Output", 5, "Word Count", "Count words in a line.", "I love Python", "3", "3", "Use split().", "print(len(input().split()))", "medium"),

  // Conditionals
  P("Conditionals", 1, "Pos/Neg/Zero", "Print Positive/Negative/Zero.", "5", "Positive", "Positive", "Use if/elif/else.", "n=int(input())\nif n>0: print('Positive')\nelif n<0: print('Negative')\nelse: print('Zero')", "easy"),
  P("Conditionals", 2, "Max of Two", "Print larger of two ints.", "9 2", "9", "9", "Compare a and b.", "a,b=map(int,input().split())\nprint(a if a>b else b)", "easy"),
  P("Conditionals", 3, "Odd/Even", "Print Odd or Even.", "10", "Even", "Even", "Check n%2.", "n=int(input())\nprint('Even' if n%2==0 else 'Odd')", "easy"),
  P("Conditionals", 4, "Grade", "Print grade from score.", "95", "A", "A", "Check ranges.", "s=int(input())\nif s>=90: print('A')\nelif s>=80: print('B')\nelif s>=70: print('C')\nelif s>=60: print('D')\nelse: print('F')", "medium"),
  P("Conditionals", 5, "Leap Year", "Print Yes if leap year.", "2024", "Yes", "Yes", "Div by 4, not 100 unless 400.", "y=int(input())\nprint('Yes' if (y%4==0 and y%100!=0) or (y%400==0) else 'No')", "medium"),

  // Loops
  P("Loops", 1, "Sum 1..N", "Sum 1 to n.", "5", "15", "15", "Use formula.", "n=int(input())\nprint(n*(n+1)//2)", "easy"),
  P("Loops", 2, "Print 1..N", "Print 1..n in one line.", "3", "1 2 3", "1 2 3", "Use join.", "n=int(input())\nprint(' '.join(str(i) for i in range(1,n+1)))", "easy"),
  P("Loops", 3, "Factorial", "Compute n!.", "5", "120", "120", "Multiply in loop.", "n=int(input())\nres=1\nfor i in range(2,n+1): res*=i\nprint(res)", "medium"),
  P("Loops", 4, "Count Digits", "Count digits of n.", "123", "3", "3", "Use while n>0.", "n=int(input())\nif n==0: print(1)\nelse:\n n=abs(n)\n c=0\n while n>0:\n  c+=1\n  n//=10\n print(c)", "medium"),
  P("Loops", 5, "Prime Check", "Print Yes if prime else No.", "13", "Yes", "Yes", "Check up to sqrt.", "n=int(input())\nif n<2: print('No')\nelse:\n ok=True\n i=2\n while i*i<=n:\n  if n%i==0: ok=False; break\n  i+=1\n print('Yes' if ok else 'No')", "hard"),

  // Functions
  P("Functions", 1, "Add Function", "Define add(a,b) and print sum.", "4 5", "9", "9", "Return a+b.", "def add(a,b): return a+b\na,b=map(int,input().split())\nprint(add(a,b))", "easy"),
  P("Functions", 2, "Max of Three", "Max of three numbers.", "3 7 5", "7", "7", "Use max().", "print(max(map(int,input().split())))", "easy"),
  P("Functions", 3, "Power", "Compute a^b.", "2 4", "16", "16", "Use **.", "a,b=map(int,input().split())\nprint(a**b)", "easy"),
  P("Functions", 4, "Count Vowels", "Count vowels in string.", "code", "2", "2", "Check aeiou.", "s=input()\nprint(sum(ch in 'aeiouAEIOU' for ch in s))", "medium"),
  P("Functions", 5, "GCD", "Compute GCD of two numbers.", "24 18", "6", "6", "Use Euclid.", "a,b=map(int,input().split())\nwhile b: a,b=b,a%b\nprint(a)", "medium"),

  // Strings
  P("Strings", 1, "Reverse", "Reverse a string.", "abc", "cba", "cba", "Use slicing.", "s=input()\nprint(s[::-1])", "easy"),
  P("Strings", 2, "Palindrome", "Check palindrome.", "madam", "Yes", "Yes", "Compare with reverse.", "s=input()\nprint('Yes' if s==s[::-1] else 'No')", "easy"),
  P("Strings", 3, "Count Char", "Count char in string.", "banana a", "3", "3", "Use count().", "s,ch=input().split()\nprint(s.count(ch))", "easy"),
  P("Strings", 4, "Remove Spaces", "Remove spaces.", "Hello World", "HelloWorld", "HelloWorld", "Use replace.", "print(input().replace(' ',''))", "easy"),
  P("Strings", 5, "First Non-Repeating", "First non-repeating char or -1.", "swiss", "w", "w", "Count then scan.", "from collections import Counter\ns=input()\nc=Counter(s)\nans='-1'\nfor ch in s:\n if c[ch]==1: ans=ch; break\nprint(ans)", "hard"),

  // Lists
  P("Lists", 1, "Sum List", "Sum list numbers.", "4\n1 2 3 4", "10", "10", "Use sum().", "n=int(input())\narr=list(map(int,input().split()))\nprint(sum(arr))", "easy"),
  P("Lists", 2, "Max in List", "Find maximum.", "5\n1 9 3 2 8", "9", "9", "Use max().", "n=int(input())\narr=list(map(int,input().split()))\nprint(max(arr))", "easy"),
  P("Lists", 3, "Count Even", "Count even numbers.", "5\n1 2 3 4 5", "2", "2", "x%2==0.", "n=int(input())\narr=list(map(int,input().split()))\nprint(sum(1 for x in arr if x%2==0))", "easy"),
  P("Lists", 4, "Rotate Left", "Rotate list left by 1.", "4\n1 2 3 4", "2 3 4 1", "2 3 4 1", "Use slicing.", "n=int(input())\narr=input().split()\nprint(' '.join(arr[1:]+arr[:1]))", "medium"),
  P("Lists", 5, "Second Largest", "Find second largest.", "5\n1 8 9 3 7", "8", "8", "Use sorted set.", "n=int(input())\narr=list(map(int,input().split()))\nvals=sorted(set(arr))\nprint(vals[-2])", "hard"),

  // Tuples & Sets
  P("Tuples & Sets", 1, "Unique Count", "Count unique numbers.", "5\n1 2 2 3 1", "3", "3", "Use set.", "n=int(input())\narr=list(map(int,input().split()))\nprint(len(set(arr)))", "easy"),
  P("Tuples & Sets", 2, "Union Size", "Union size of two sets.", "1 2 3\n3 4 5", "5", "5", "Use |.", "a=set(map(int,input().split()))\nb=set(map(int,input().split()))\nprint(len(a|b))", "easy"),
  P("Tuples & Sets", 3, "Intersection", "Intersection sorted.", "1 2 3\n2 3 4", "2 3", "2 3", "Use &.", "a=set(map(int,input().split()))\nb=set(map(int,input().split()))\nprint(' '.join(map(str,sorted(a&b))))", "medium"),
  P("Tuples & Sets", 4, "Tuple Sum", "Sum tuple of 3 numbers.", "1 2 3", "6", "6", "Use sum().", "t=tuple(map(int,input().split()))\nprint(sum(t))", "easy"),
  P("Tuples & Sets", 5, "Sym Diff", "Symmetric difference size.", "1 2 3\n2 3 4", "2", "2", "Use ^.", "a=set(map(int,input().split()))\nb=set(map(int,input().split()))\nprint(len(a^b))", "medium"),

  // Dictionaries
  P("Dictionaries", 1, "Word Count", "Word frequencies.", "apple banana apple", "apple:2 banana:1", "apple:2 banana:1", "Use dict count.", "from collections import Counter\nwords=input().split()\nc=Counter(words)\nprint(' '.join(f\"{k}:{c[k]}\" for k in sorted(c)))", "medium"),
  P("Dictionaries", 2, "Key Lookup", "Print value for key or -1.", "3\na 5\nb 10\nc 7\nb", "10", "10", "Use dict.get.", "n=int(input())\nd={}\nfor _ in range(n):\n k,v=input().split(); d[k]=v\nq=input()\nprint(d.get(q,'-1'))", "medium"),
  P("Dictionaries", 3, "Most Frequent", "Most frequent character.", "banana", "a", "a", "Count and pick max.", "from collections import Counter\ns=input()\nc=Counter(s)\nprint(sorted(c.items(), key=lambda x:(-x[1],x[0]))[0][0])", "hard"),
  P("Dictionaries", 4, "Map Sum", "Sum values of pairs.", "3\nx 5\ny 10\nz 7", "22", "22", "Sum values.", "n=int(input())\nprint(sum(int(input().split()[1]) for _ in range(n)))", "easy"),
  P("Dictionaries", 5, "Invert Map", "Invert and lookup.", "2\na 1\nb 2\n1", "a", "a", "Swap key/value.", "n=int(input())\ninv={}\nfor _ in range(n):\n k,v=input().split(); inv[v]=k\nq=input()\nprint(inv.get(q,'-1'))", "medium"),

  // Recursion
  P("Recursion", 1, "Factorial Rec", "Compute factorial recursively.", "5", "120", "120", "Base case n<=1.", "def f(n): return 1 if n<=1 else n*f(n-1)\nprint(f(int(input())))", "medium"),
  P("Recursion", 2, "Fibonacci", "Compute nth Fibonacci (0-indexed).", "4", "3", "3", "Use recursion.", "def f(n): return n if n<=1 else f(n-1)+f(n-2)\nprint(f(int(input())))", "medium"),
  P("Recursion", 3, "Sum Array", "Sum list recursively.", "3\n1 2 3", "6", "6", "Sum head + tail.", "def f(a): return 0 if not a else a[0]+f(a[1:])\ninput()\narr=list(map(int,input().split()))\nprint(f(arr))", "hard"),
  P("Recursion", 4, "Power Rec", "Compute a^b recursively.", "2 3", "8", "8", "b==0 => 1.", "def p(a,b): return 1 if b==0 else a*p(a,b-1)\na,b=map(int,input().split())\nprint(p(a,b))", "easy"),
  P("Recursion", 5, "Reverse Rec", "Reverse string recursively.", "abc", "cba", "cba", "Use recursion.", "def r(s): return s if len(s)<=1 else r(s[1:])+s[0]\nprint(r(input()))", "hard"),

  // Sorting Basics
  P("Sorting Basics", 1, "Sort Asc", "Sort numbers ascending.", "3\n3 1 2", "1 2 3", "1 2 3", "Use sorted().", "n=int(input())\narr=sorted(map(int,input().split()))\nprint(' '.join(map(str,arr)))", "easy"),
  P("Sorting Basics", 2, "Sort Desc", "Sort numbers descending.", "3\n3 1 2", "3 2 1", "3 2 1", "Use reverse=True.", "n=int(input())\narr=sorted(map(int,input().split()), reverse=True)\nprint(' '.join(map(str,arr)))", "easy"),
  P("Sorting Basics", 3, "Sort by Length", "Sort words by length.", "a zoo to", "a to zoo", "a to zoo", "Key=(len,word).", "w=input().split()\nprint(' '.join(sorted(w,key=lambda x:(len(x),x))))", "medium"),
  P("Sorting Basics", 4, "Kth Smallest", "Print kth smallest.", "5 3\n5 1 3 2 4", "3", "3", "Sort and pick.", "n,k=map(int,input().split())\narr=sorted(map(int,input().split()))\nprint(arr[k-1])", "medium"),
  P("Sorting Basics", 5, "Sort Pairs", "Sort pairs by second.", "3\n1 2\n2 5\n3 4", "1 2\n3 4\n2 5", "1 2\n3 4\n2 5", "Sort by x[1].", "n=int(input())\narr=[tuple(map(int,input().split())) for _ in range(n)]\narr=sorted(arr, key=lambda x:x[1])\nprint('\\n'.join(f\"{a} {b}\" for a,b in arr))", "medium"),

  // Searching Basics
  P("Searching Basics", 1, "Linear Search", "Find index of x or -1.", "5\n1 2 3 4 5\n3", "2", "2", "Scan list.", "n=int(input())\narr=list(map(int,input().split()))\nx=int(input())\nprint(arr.index(x) if x in arr else -1)", "easy"),
  P("Searching Basics", 2, "Binary Search", "Binary search in sorted list.", "5\n1 2 3 4 5\n4", "3", "3", "Use while loop.", "n=int(input())\narr=list(map(int,input().split()))\nx=int(input())\nl,r=0,n-1\nans=-1\nwhile l<=r:\n m=(l+r)//2\n if arr[m]==x: ans=m; break\n if arr[m]<x: l=m+1\n else: r=m-1\nprint(ans)", "medium"),
  P("Searching Basics", 3, "First Occurrence", "First index of x.", "5\n1 2 2 2 3\n2", "1", "1", "Binary search left.", "n=int(input())\narr=list(map(int,input().split()))\nx=int(input())\nl,r=0,n-1\nans=-1\nwhile l<=r:\n m=(l+r)//2\n if arr[m]>=x: r=m-1\n else: l=m+1\n if arr[m]==x: ans=m\nprint(ans)", "hard"),
  P("Searching Basics", 4, "Count Occurrences", "Count x in sorted list.", "6\n1 2 2 2 3 4\n2", "3", "3", "Use bisect.", "from bisect import bisect_left,bisect_right\ninput()\narr=list(map(int,input().split()))\nx=int(input())\nprint(bisect_right(arr,x)-bisect_left(arr,x))", "medium"),
  P("Searching Basics", 5, "Peak Element", "Find any peak index.", "5\n1 2 3 1 0", "2", "2", "Binary search variant.", "n=int(input())\narr=list(map(int,input().split()))\nl,r=0,n-1\nwhile l<r:\n m=(l+r)//2\n if arr[m]<arr[m+1]: l=m+1\n else: r=m\nprint(l)", "hard"),

  // Two Pointers
  P("Two Pointers", 1, "Pair Sum", "Pair sum exists in sorted list.", "5\n1 2 3 4 5\n6", "Yes", "Yes", "Two pointers.", "n=int(input())\narr=list(map(int,input().split()))\nt=int(input())\ni,j=0,n-1\nok=False\nwhile i<j:\n s=arr[i]+arr[j]\n if s==t: ok=True; break\n if s<t: i+=1\n else: j-=1\nprint('Yes' if ok else 'No')", "medium"),
  P("Two Pointers", 2, "Remove Duplicates", "Count unique in sorted list.", "5\n1 1 2 2 3", "3", "3", "Skip duplicates.", "n=int(input())\narr=list(map(int,input().split()))\nif n==0: print(0)\nelse:\n c=1\n for i in range(1,n):\n  if arr[i]!=arr[i-1]: c+=1\n print(c)", "easy"),
  P("Two Pointers", 3, "Reverse Vowels", "Reverse vowels only.", "hello", "holle", "holle", "Two pointers.", "s=list(input())\nv=set('aeiouAEIOU')\ni,j=0,len(s)-1\nwhile i<j:\n if s[i] not in v: i+=1; continue\n if s[j] not in v: j-=1; continue\n s[i],s[j]=s[j],s[i]; i+=1; j-=1\nprint(''.join(s))", "medium"),
  P("Two Pointers", 4, "Subsequence", "Check if s is subsequence of t.", "abc\nahbgdc", "Yes", "Yes", "Two pointers.", "s=input().strip()\nt=input().strip()\ni=j=0\nwhile i<len(s) and j<len(t):\n if s[i]==t[j]: i+=1\n j+=1\nprint('Yes' if i==len(s) else 'No')", "easy"),
  P("Two Pointers", 5, "Container", "Max water container.", "9\n1 8 6 2 5 4 8 3 7", "49", "49", "Move smaller pointer.", "n=int(input())\narr=list(map(int,input().split()))\ni,j=0,n-1\nans=0\nwhile i<j:\n ans=max(ans,(j-i)*min(arr[i],arr[j]))\n if arr[i]<arr[j]: i+=1\n else: j-=1\nprint(ans)", "hard"),

  // Prefix Sum
  P("Prefix Sum", 1, "Build Prefix", "Print prefix sums.", "4\n1 2 3 4", "1 3 6 10", "1 3 6 10", "Accumulate.", "n=int(input())\narr=list(map(int,input().split()))\nps=[]\ncur=0\nfor x in arr: cur+=x; ps.append(cur)\nprint(' '.join(map(str,ps)))", "easy"),
  P("Prefix Sum", 2, "Range Sum", "Answer range sums.", "5\n1 2 3 4 5\n2\n1 3\n2 5", "6\n9", "6\n9", "Use prefix.", "n=int(input())\narr=list(map(int,input().split()))\nps=[0]\nfor x in arr: ps.append(ps[-1]+x)\nq=int(input())\nfor _ in range(q):\n l,r=map(int,input().split())\n print(ps[r]-ps[l-1])", "medium"),
  P("Prefix Sum", 3, "Subarray Sum K", "Count subarrays sum k.", "5\n1 1 1 2 1\n2", "2", "2", "Use hashmap.", "n=int(input())\narr=list(map(int,input().split()))\nk=int(input())\nfrom collections import defaultdict\ncnt=defaultdict(int)\ncnt[0]=1\ns=0\nans=0\nfor x in arr:\n s+=x\n ans+=cnt[s-k]\n cnt[s]+=1\nprint(ans)", "hard"),
  P("Prefix Sum", 4, "Max Subarray", "Maximum subarray sum.", "5\n-2 1 -3 4 -1", "4", "4", "Kadane's.", "n=int(input())\narr=list(map(int,input().split()))\nbest=cur=arr[0]\nfor x in arr[1:]:\n cur=max(x,cur+x)\n best=max(best,cur)\nprint(best)", "medium"),
  P("Prefix Sum", 5, "Balance Index", "Index where left==right sum.", "7\n1 2 3 4 6 3 1", "3", "3", "Use prefix sums.", "n=int(input())\narr=list(map(int,input().split()))\nps=[0]\nfor x in arr: ps.append(ps[-1]+x)\nans=-1\nfor i in range(1,n+1):\n if ps[i-1]==ps[n]-ps[i]: ans=i-1; break\nprint(ans)", "hard"),

  // Stack
  P("Stack", 1, "Valid Brackets", "Check balanced brackets.", "([])", "Yes", "Yes", "Use stack.", "s=input().strip()\nstack=[]\nmp={')':'(',']':'[','}':'{'}\nok=True\nfor ch in s:\n if ch in '([{': stack.append(ch)\n else:\n  if not stack or stack[-1]!=mp.get(ch,''): ok=False; break\n  stack.pop()\nif stack: ok=False\nprint('Yes' if ok else 'No')", "medium"),
  P("Stack", 2, "Next Greater", "Next greater element.", "4\n2 3 2 4", "3 4 4 -1", "3 4 4 -1", "Use stack.", "n=int(input())\narr=list(map(int,input().split()))\nres=[-1]*n\nst=[]\nfor i,x in enumerate(arr):\n while st and arr[st[-1]]<x:\n  res[st.pop()]=x\n st.append(i)\nprint(' '.join(map(str,res)))", "hard"),
  P("Stack", 3, "Op Count", "Push n and pop n, print ops.", "5", "10", "10", "2*n ops.", "n=int(input())\nprint(n*2)", "easy"),
  P("Stack", 4, "Evaluate RPN", "Evaluate RPN.", "5\n2 1 + 3 * 2 +", "9", "9", "Use stack.", "input()\narr=input().split()\nstack=[]\nfor t in arr:\n if t in '+-*/':\n  b=stack.pop(); a=stack.pop()\n  if t=='+': stack.append(a+b)\n  elif t=='-': stack.append(a-b)\n  elif t=='*': stack.append(a*b)\n  else: stack.append(int(a/b))\n else:\n  stack.append(int(t))\nprint(stack[-1])", "hard"),
  P("Stack", 5, "Remove Adjacent", "Remove adjacent duplicates.", "abbaca", "ca", "ca", "Use stack.", "s=input().strip()\nstack=[]\nfor ch in s:\n if stack and stack[-1]==ch: stack.pop()\n else: stack.append(ch)\nprint(''.join(stack))", "medium"),

  // Queue
  P("Queue", 1, "Print 1..N", "Print 1..n.", "3", "1 2 3", "1 2 3", "Simple loop.", "n=int(input())\nprint(' '.join(str(i) for i in range(1,n+1)))", "easy"),
  P("Queue", 2, "Hot Potato", "Simulate queue rotation.", "5 2", "3", "3", "Use deque.", "from collections import deque\nn,k=map(int,input().split())\nq=deque(range(1,n+1))\nwhile len(q)>1:\n for _ in range(k-1): q.append(q.popleft())\n q.popleft()\nprint(q[0])", "medium"),
  P("Queue", 3, "First Non-Repeat", "First non-repeating in stream.", "a a b a c b", "b", "b", "Queue + counts.", "from collections import deque, Counter\narr=input().split()\ncount=Counter()\nq=deque()\nfor ch in arr:\n count[ch]+=1\n q.append(ch)\n while q and count[q[0]]>1: q.popleft()\nprint(q[0] if q else '-1')", "hard"),
  P("Queue", 4, "Circular Index", "Last index after k steps.", "5 7", "2", "2", "(k-1)%n.", "n,k=map(int,input().split())\nprint((k-1)%n)", "easy"),
  P("Queue", 5, "Process Time", "Time to process all.", "5", "5", "5", "Output n.", "n=int(input())\nprint(n)", "easy"),

  // Linked List
  P("Linked List", 1, "Length", "Print n.", "4", "4", "4", "Output n.", "print(int(input()))", "easy"),
  P("Linked List", 2, "Middle", "Print middle element.", "5\n1 2 3 4 5", "3", "3", "Index n//2.", "n=int(input())\narr=list(map(int,input().split()))\nprint(arr[n//2])", "easy"),
  P("Linked List", 3, "Reverse", "Print list reversed.", "3\n1 2 3", "3 2 1", "3 2 1", "Use slicing.", "n=int(input())\narr=input().split()\nprint(' '.join(arr[::-1]))", "easy"),
  P("Linked List", 4, "Remove Consecutive", "Remove consecutive duplicates.", "6\n1 1 2 2 3 3", "1 2 3", "1 2 3", "Skip equal neighbors.", "n=int(input())\narr=list(map(int,input().split()))\nres=[arr[0]]\nfor x in arr[1:]:\n if x!=res[-1]: res.append(x)\nprint(' '.join(map(str,res)))", "medium"),
  P("Linked List", 5, "Merge Two", "Merge two sorted lists.", "2\n1 3\n2\n2 4", "1 2 3 4", "1 2 3 4", "Two pointers.", "n=int(input())\na=list(map(int,input().split()))\nm=int(input())\nb=list(map(int,input().split()))\nres=[]\ni=j=0\nwhile i<n and j<m:\n if a[i]<b[j]: res.append(a[i]); i+=1\n else: res.append(b[j]); j+=1\nres+=a[i:]+b[j:]\nprint(' '.join(map(str,res)))", "hard"),

  // Trees
  P("Trees", 1, "Tree Height", "Print height for n levels.", "3", "3", "3", "Height=levels.", "print(int(input()))", "easy"),
  P("Trees", 2, "Inorder", "Print sorted list (BST inorder).", "3\n1 2 3", "1 2 3", "1 2 3", "Inorder is sorted.", "input(); arr=input().split()\nprint(' '.join(arr))", "easy"),
  P("Trees", 3, "Count Leaves", "Leaves in full binary tree.", "3", "4", "4", "2^(h-1).", "h=int(input())\nprint(2**(h-1))", "medium"),
  P("Trees", 4, "Level Order", "Print as level order.", "4\n1 2 3 4", "1 2 3 4", "1 2 3 4", "Same order.", "input(); arr=input().split()\nprint(' '.join(arr))", "easy"),
  P("Trees", 5, "Diameter", "Diameter of line tree.", "5", "4", "4", "n-1.", "n=int(input())\nprint(n-1)", "medium"),

  // Graphs
  P("Graphs", 1, "Edges Count", "Print m.", "4 3", "3", "3", "Output m.", "n,m=map(int,input().split())\nprint(m)", "easy"),
  P("Graphs", 2, "Degree of 1", "Degree of node 1.", "4 3\n1 2\n2 3\n1 4", "2", "2", "Count edges.", "n,m=map(int,input().split())\ncount=0\nfor _ in range(m):\n a,b=map(int,input().split())\n if a==1 or b==1: count+=1\nprint(count)", "easy"),
  P("Graphs", 3, "Reachable", "Is n reachable from 1.", "4 3\n1 2\n2 3\n3 4", "Yes", "Yes", "Use BFS/DFS.", "from collections import deque\nn,m=map(int,input().split())\nG=[[] for _ in range(n+1)]\nfor _ in range(m):\n a,b=map(int,input().split())\n G[a].append(b); G[b].append(a)\nq=deque([1]); vis=[False]*(n+1); vis[1]=True\nwhile q:\n u=q.popleft()\n for v in G[u]:\n  if not vis[v]: vis[v]=True; q.append(v)\nprint('Yes' if vis[n] else 'No')", "medium"),
  P("Graphs", 4, "Components", "Count connected components.", "4 2\n1 2\n3 4", "2", "2", "DFS each node.", "n,m=map(int,input().split())\nG=[[] for _ in range(n+1)]\nfor _ in range(m):\n a,b=map(int,input().split())\n G[a].append(b); G[b].append(a)\nvis=[False]*(n+1); cc=0\nfor i in range(1,n+1):\n if not vis[i]:\n  cc+=1; stack=[i]; vis[i]=True\n  while stack:\n   u=stack.pop()\n   for v in G[u]:\n    if not vis[v]: vis[v]=True; stack.append(v)\nprint(cc)", "hard"),
  P("Graphs", 5, "Shortest Path", "Shortest path length 1->n.", "4 3\n1 2\n2 3\n3 4", "3", "3", "Use BFS.", "from collections import deque\nn,m=map(int,input().split())\nG=[[] for _ in range(n+1)]\nfor _ in range(m):\n a,b=map(int,input().split())\n G[a].append(b); G[b].append(a)\nq=deque([1]); INF=10**9\nd=[INF]*(n+1); d[1]=0\nwhile q:\n u=q.popleft()\n for v in G[u]:\n  if d[v]>d[u]+1:\n   d[v]=d[u]+1; q.append(v)\nprint(d[n] if d[n]<INF else -1)", "hard")
];

const run = async () => {
  await connectDB();

  const topicIdMap = {};
  for (const t of topics) {
    let doc = await Topic.findOne({ title: t.title });
    if (!doc) doc = await Topic.create(t);
    topicIdMap[t.title] = doc._id.toString();
  }

  for (const p of problems) {
    const topicId = topicIdMap[p.topicTitle];
    if (!topicId) continue;
    const exists = await Problem.findOne({ title: p.title, topicId });
    if (exists) continue;
    await Problem.create({
      topicId,
      title: p.title,
      statement: p.statement,
      expectedOutput: p.expectedOutput,
      hint: p.hint,
      solution: p.solution,
      hiddenTestcases: p.hiddenTestcases,
      sampleInput: p.sampleInput,
      sampleOutput: p.sampleOutput,
      rulesConstraints: p.rulesConstraints,
      order: p.order,
      difficulty: p.difficulty
    });
  }

  console.log("Seed complete");
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});

