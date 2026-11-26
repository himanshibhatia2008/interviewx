// Technical Interview Lab question bank. answer = index of the correct option.
export const TOPICS = [
  { id: "C", name: "C Programming", icon: "code", blurb: "Pointers, memory & the basics" },
  { id: "C++", name: "C++", icon: "layers", blurb: "OOP, STL & polymorphism" },
  { id: "Python", name: "Python", icon: "terminal", blurb: "Data types & Pythonic idioms" },
  { id: "Java", name: "Java", icon: "coffee", blurb: "OOP, strings & exceptions" },
  { id: "SQL", name: "SQL & DBMS", icon: "database", blurb: "Queries, joins & keys" },
  { id: "DSA", name: "Data Structures & Algorithms", icon: "grid", blurb: "Complexity & classic structures" },
  { id: "CS", name: "CS Fundamentals", icon: "cpu", blurb: "OS, networks & databases" },
];

const q = (id, topic, difficulty, question, options, answer, explain, code) => ({ id, topic, difficulty, question, options, answer, explain, code });

export const MCQS = [
  // ---------------- C ----------------
  q("c1", "C", "Easy", "What is the value of sizeof(char) in C?", ["1", "2", "4", "Depends on the compiler"], 0, "The C standard defines sizeof(char) as exactly 1 on every platform; other sizes are measured in multiples of char."),
  q("c2", "C", "Easy", "Which header file declares printf() and scanf()?", ["<stdlib.h>", "<stdio.h>", "<string.h>", "<conio.h>"], 1, "<stdio.h> (standard input/output) declares printf, scanf, fopen and the other I/O functions."),
  q("c3", "C", "Easy", "Which character marks the end of a string in C?", ["'\\n'", "'0'", "'\\0'", "EOF"], 2, "C strings are null-terminated: the character '\\0' (value 0) marks where the string ends."),
  q("c4", "C", "Medium", "Which format specifier reads a double with scanf()?", ["%d", "%f", "%lf", "%e"], 2, "scanf needs %lf for a double (and %f for a float) because it writes through a pointer of that exact type."),
  q("c5", "C", "Medium", "What does malloc() return if it cannot allocate memory?", ["0 bytes of memory", "NULL", "-1", "It terminates the program"], 1, "malloc returns a NULL pointer on failure, so always check the result before using it."),
  q("c6", "C", "Medium", "Which storage class keeps a local variable's value between function calls?", ["auto", "register", "static", "extern"], 2, "A static local variable is initialised once and keeps its value for the lifetime of the program."),
  q("c7", "C", "Medium", "When an array is passed to a function in C, what actually gets passed?", ["A copy of the whole array", "A pointer to its first element", "The array's length", "A reference to a copy"], 1, "Arrays decay to a pointer to their first element, which is why the function can modify the caller's array."),
  q("c8", "C", "Hard", "If int *p points to an int array and sizeof(int) is 4, how many bytes does p + 1 move forward?", ["1", "2", "4", "8"], 2, "Pointer arithmetic is scaled by the size of the pointed-to type, so p + 1 advances by sizeof(int) = 4 bytes.", "int arr[3] = {10, 20, 30};\nint *p = arr;\nprintf(\"%d\", *(p + 1)); // 20"),
  q("c9", "C", "Hard", "Which of these is NOT a keyword in C?", ["volatile", "class", "register", "typedef"], 1, "class is a C++ keyword. C has no classes; it uses struct for grouping data."),

  // ---------------- C++ ----------------
  q("cpp1", "C++", "Easy", "What is the default access specifier for members of a class in C++?", ["public", "private", "protected", "internal"], 1, "Class members are private by default; struct members are public by default."),
  q("cpp2", "C++", "Easy", "Function overloading is an example of which kind of polymorphism?", ["Run-time", "Compile-time", "Dynamic", "Parametric only"], 1, "The compiler chooses which overload to call from the argument types, so it is resolved at compile time."),
  q("cpp3", "C++", "Medium", "What does declaring a member function virtual enable?", ["Inline expansion", "Run-time polymorphism (dynamic dispatch)", "Faster function calls", "Multiple inheritance"], 1, "A virtual function is dispatched through the vtable, so the derived class's override runs even through a base pointer."),
  q("cpp4", "C++", "Medium", "Which operator can NOT be overloaded in C++?", ["+", "[]", "::", "<<"], 2, "The scope resolution operator ::, member access ., .*, the ternary ?: and sizeof cannot be overloaded."),
  q("cpp5", "C++", "Medium", "What makes a class abstract in C++?", ["Declaring it with the abstract keyword", "Having at least one pure virtual function", "Having only private constructors", "Having no data members"], 1, "A pure virtual function (virtual void f() = 0;) makes the class abstract, so it cannot be instantiated."),
  q("cpp6", "C++", "Medium", "How does new differ from malloc()?", ["new is faster", "new calls the constructor; malloc only allocates raw memory", "malloc calls the constructor", "There is no difference"], 1, "new allocates memory and constructs the object; malloc returns uninitialised memory and needs a cast in C++."),
  q("cpp7", "C++", "Hard", "When should a base class destructor be virtual?", ["Never", "When a derived object may be deleted through a base-class pointer", "Only for abstract classes", "Only when using templates"], 1, "Without a virtual destructor, deleting a derived object through a base pointer is undefined behaviour and skips the derived destructor."),
  q("cpp8", "C++", "Hard", "What is the amortised time complexity of std::vector::push_back?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 0, "The vector grows its capacity geometrically, so occasional O(n) reallocations average out to O(1) per insertion."),
  q("cpp9", "C++", "Hard", "Which statement about C++ references is true?", ["A reference can be null", "A reference can be reseated to another object", "A reference must be initialised when declared", "References use -> for member access"], 2, "A reference is an alias: it must be bound at initialisation and cannot later refer to a different object."),

  // ---------------- Python ----------------
  q("py1", "Python", "Easy", "Which of these Python types is immutable?", ["list", "dict", "set", "tuple"], 3, "Tuples cannot be changed after creation; lists, dicts and sets are mutable."),
  q("py2", "Python", "Easy", "What does print(7 // 2) output?", ["3.5", "3", "4", "3.0"], 1, "// is floor division, so 7 // 2 is 3 (an int)."),
  q("py3", "Python", "Easy", "What is the output?", ["[1, 2, 3]", "[3, 2, 1]", "Error", "[3]"], 1, "A slice with step -1 walks the list backwards, producing a reversed copy.", "nums = [1, 2, 3]\nprint(nums[::-1])"),
  q("py4", "Python", "Easy", "What does len({1, 1, 2, 2, 3}) return?", ["5", "3", "2", "Error"], 1, "A set stores unique values only, so {1, 1, 2, 2, 3} becomes {1, 2, 3}."),
  q("py5", "Python", "Medium", "Which keyword turns a function into a generator?", ["return", "yield", "async", "lambda"], 1, "A function containing yield returns a generator that produces values lazily, one at a time."),
  q("py6", "Python", "Medium", "What is __init__ used for in a Python class?", ["Deleting an object", "Initialising a new object's attributes", "Importing modules", "Declaring private methods"], 1, "__init__ runs right after a new instance is created and sets up its attributes."),
  q("py7", "Python", "Medium", "What does \"ab\" * 3 evaluate to?", ["\"ababab\"", "\"ab3\"", "Error", "[\"ab\", \"ab\", \"ab\"]"], 0, "Multiplying a string by an int repeats it."),
  q("py8", "Python", "Hard", "What does this code print?", ["[2]", "[1, 2]", "[2, 2]", "Error"], 1, "Default arguments are evaluated once, so the same list is shared between calls. Use items=None and create the list inside instead.", "def add(x, items=[]):\n    items.append(x)\n    return items\n\nadd(1)\nprint(add(2))"),
  q("py9", "Python", "Hard", "What is the time complexity of checking `x in my_set` on average?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 0, "Sets are hash tables, so membership tests are O(1) on average (lists are O(n))."),

  // ---------------- Java ----------------
  q("j1", "Java", "Easy", "What is the size of an int in Java?", ["16 bits", "32 bits", "64 bits", "Platform dependent"], 1, "Java fixes int at 32 bits on every platform, which is part of its portability."),
  q("j2", "Java", "Easy", "Which keyword is used to inherit from a class?", ["implements", "inherits", "extends", "super"], 2, "A class uses extends to inherit from one superclass and implements for interfaces."),
  q("j3", "Java", "Easy", "Which component executes Java bytecode?", ["JDK", "JVM", "javac", "JAR"], 1, "javac compiles source into bytecode; the Java Virtual Machine (JVM) runs it."),
  q("j4", "Java", "Medium", "Java Strings are…", ["Mutable", "Immutable", "Mutable only inside methods", "Primitive types"], 1, "String objects cannot change. Use StringBuilder when you need to build a string in a loop."),
  q("j5", "Java", "Medium", "For two String objects, what does == compare?", ["Their characters", "Their lengths", "Their references (same object)", "Their hash codes"], 2, "== checks whether both variables point to the same object; use .equals() to compare content."),
  q("j6", "Java", "Medium", "How does Java support multiple inheritance of type?", ["Through multiple extends", "Through interfaces", "Through abstract classes only", "It does not"], 1, "A class can extend only one class but can implement many interfaces."),
  q("j7", "Java", "Medium", "What is the default value of an int instance field?", ["null", "0", "Undefined", "-1"], 1, "Instance and static fields get default values (0 for numbers, false, null). Local variables do not."),
  q("j8", "Java", "Hard", "What does marking a class final do?", ["Makes its fields constant", "Prevents it from being subclassed", "Makes all methods static", "Prevents object creation"], 1, "A final class cannot be extended. String is a well-known final class."),
  q("j9", "Java", "Hard", "Which of these is a checked exception?", ["NullPointerException", "ArithmeticException", "IOException", "ArrayIndexOutOfBoundsException"], 2, "Checked exceptions such as IOException must be caught or declared with throws; the others are unchecked RuntimeExceptions."),

  // ---------------- SQL ----------------
  q("s1", "SQL", "Easy", "Which keyword removes duplicate rows from a SELECT result?", ["UNIQUE", "DISTINCT", "DIFFERENT", "GROUP"], 1, "SELECT DISTINCT returns only unique rows."),
  q("s2", "SQL", "Easy", "What does a PRIMARY KEY guarantee?", ["Values are sorted", "Values are unique and not NULL", "Values are numeric", "Values are indexed in another table"], 1, "A primary key uniquely identifies each row, so it must be unique and cannot be NULL."),
  q("s3", "SQL", "Easy", "Which clause filters groups after GROUP BY?", ["WHERE", "HAVING", "ORDER BY", "FILTER"], 1, "WHERE filters rows before grouping; HAVING filters the grouped results (e.g. HAVING COUNT(*) > 5)."),
  q("s4", "SQL", "Medium", "What does a LEFT JOIN return?", ["Only matching rows", "All rows from the left table, with NULLs where there is no match", "All rows from both tables", "Only non-matching rows"], 1, "LEFT JOIN keeps every row from the left table and fills right-table columns with NULL when there is no match."),
  q("s5", "SQL", "Medium", "How does COUNT(column) differ from COUNT(*)?", ["No difference", "COUNT(column) ignores NULL values", "COUNT(*) ignores NULL rows", "COUNT(column) counts distinct values"], 1, "COUNT(*) counts all rows; COUNT(column) counts only rows where that column is not NULL."),
  q("s6", "SQL", "Medium", "Which statement about TRUNCATE is true?", ["It can use a WHERE clause", "It removes all rows from a table", "It deletes the table structure", "It only works on views"], 1, "TRUNCATE removes every row quickly but keeps the table. Use DELETE ... WHERE to remove specific rows, and DROP to remove the table."),
  q("s7", "SQL", "Medium", "First Normal Form (1NF) requires that…", ["Every table has a foreign key", "Each column holds atomic (indivisible) values", "There are no partial dependencies", "There are no transitive dependencies"], 1, "1NF means no repeating groups or multi-valued cells. 2NF removes partial dependencies; 3NF removes transitive ones."),
  q("s8", "SQL", "Hard", "Which query returns the second-highest salary?", ["SELECT MAX(salary) FROM emp", "SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp)", "SELECT salary FROM emp ORDER BY salary LIMIT 2", "SELECT MIN(salary) FROM emp"], 1, "The subquery finds the highest salary; the outer query takes the maximum of everything below it."),
  q("s9", "SQL", "Hard", "In logical query processing, which clause is evaluated first?", ["SELECT", "WHERE", "FROM", "ORDER BY"], 2, "The logical order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. That is why SELECT aliases can't be used in WHERE."),

  // ---------------- DSA ----------------
  q("d1", "DSA", "Easy", "What is the time complexity of binary search on a sorted array?", ["O(n)", "O(log n)", "O(1)", "O(n log n)"], 1, "Each step halves the search range, giving O(log n)."),
  q("d2", "DSA", "Easy", "Which data structure follows Last-In-First-Out (LIFO)?", ["Queue", "Stack", "Linked list", "Heap"], 1, "A stack pops the most recently pushed item first — like a stack of plates."),
  q("d3", "DSA", "Easy", "Which data structure does Breadth-First Search use?", ["Stack", "Queue", "Priority queue", "Hash map"], 1, "BFS explores level by level using a FIFO queue; DFS uses a stack (or recursion)."),
  q("d4", "DSA", "Medium", "What is the worst-case time complexity of quicksort?", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], 2, "Consistently bad pivots (e.g. already sorted input with first-element pivot) give O(n²); the average is O(n log n)."),
  q("d5", "DSA", "Medium", "What is the average time to look up a key in a hash table?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 0, "With a good hash function and load factor, lookups are O(1) on average (O(n) worst case with many collisions)."),
  q("d6", "DSA", "Medium", "An inorder traversal of a binary search tree visits the keys in…", ["Random order", "Sorted (ascending) order", "Reverse order", "Level order"], 1, "Inorder visits left subtree, node, right subtree — which for a BST yields ascending order."),
  q("d7", "DSA", "Medium", "Which technique detects a cycle in a linked list using O(1) extra space?", ["Hashing visited nodes", "Floyd's slow and fast pointers", "Sorting the list", "Binary search"], 1, "Floyd's tortoise-and-hare: if the fast pointer ever meets the slow pointer, there is a cycle."),
  q("d8", "DSA", "Hard", "What is the auxiliary space complexity of standard merge sort on an array?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 2, "Merging needs a temporary array proportional to n."),
  q("d9", "DSA", "Hard", "Dijkstra's algorithm can give wrong answers when the graph has…", ["Cycles", "Negative edge weights", "More than 1000 nodes", "Undirected edges"], 1, "Dijkstra assumes a finalised node can't get cheaper later, which breaks with negative edges. Use Bellman-Ford instead."),

  // ---------------- CS fundamentals ----------------
  q("cs1", "CS", "Easy", "What does DNS do?", ["Encrypts web traffic", "Translates domain names into IP addresses", "Assigns IP addresses to devices", "Stores web pages"], 1, "The Domain Name System resolves names like example.com to IP addresses. DHCP is what assigns IP addresses."),
  q("cs2", "CS", "Easy", "What is the default port for HTTPS?", ["80", "21", "443", "8080"], 2, "HTTPS uses port 443; plain HTTP uses port 80."),
  q("cs3", "CS", "Easy", "In ACID transactions, what does the A stand for?", ["Availability", "Atomicity", "Accuracy", "Authorisation"], 1, "Atomicity: a transaction happens completely or not at all. The others are Consistency, Isolation and Durability."),
  q("cs4", "CS", "Medium", "How do threads differ from processes?", ["Threads have separate memory spaces", "Threads of a process share the same address space", "Processes are always faster", "Threads cannot run concurrently"], 1, "Threads within a process share code, data and heap (each has its own stack), so switching between them is cheaper."),
  q("cs5", "CS", "Medium", "Which is a key difference between TCP and UDP?", ["UDP guarantees delivery", "TCP is connection-oriented and reliable", "TCP has no headers", "UDP is only used for email"], 1, "TCP sets up a connection and guarantees ordered, reliable delivery; UDP is connectionless and faster but unreliable."),
  q("cs6", "CS", "Medium", "Which OSI layer is responsible for routing packets between networks?", ["Data link", "Transport", "Network", "Session"], 2, "The network layer (layer 3, e.g. IP) handles logical addressing and routing."),
  q("cs7", "CS", "Medium", "Which of these is NOT one of the four necessary conditions for deadlock?", ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], 2, "The four conditions are mutual exclusion, hold and wait, NO preemption and circular wait. Allowing preemption prevents deadlock."),
  q("cs8", "CS", "Hard", "Paging in memory management eliminates which problem?", ["Internal fragmentation", "External fragmentation", "Thrashing", "Page faults"], 1, "Fixed-size pages fit into any free frame, removing external fragmentation (some internal fragmentation remains)."),
  q("cs9", "CS", "Hard", "What is thrashing?", ["A CPU overheating", "The system spending more time paging than executing processes", "A disk failure", "A deadlock between two threads"], 1, "When processes don't have enough frames, constant page faults make the system swap pages instead of doing useful work."),
];
