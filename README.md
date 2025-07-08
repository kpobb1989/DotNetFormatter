# DotNetFormatter

DotNetFormatter is a handy tool that automatically formats C# code on LeetCode and AlgoExpert pages. Behind the scenes, it works by integrating a user script (via Tampermonkey) with a local .NET API. Once set up, the formatter hooks into LeetCode’s and AlgoExpert's editors and gives you quick access to beautifully formatted C# code.

# How to install
1. Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) extension for Google Chrome
2. Install [user script](https://github.com/kpobb1989/LeetCodeDotNetFormatter/raw/refs/heads/main/Solution/DotNetFormatter.user.js)
3. Install [.Net Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) (If it isn't installed already)
4. Download [DotNetFormatter.exe](https://github.com/kpobb1989/LeetCodeDotNetFormatter/raw/refs/heads/main/Solution/DotNetFormatter.exe) (make sure port 5000 is available)

# How to use
1. Run DotNetFormatter.exe. It functions as an API and runs at http://localhost:5000
![image](https://github.com/user-attachments/assets/4f3d47a4-a200-4d8f-8248-17598ffc1bec)

Visiting this link will display a Swagger page
![image](https://github.com/user-attachments/assets/1ed28b8d-6048-45ca-8a56-06b629b15e3f)

2. Open LeetCode or AlgoExpert problem page, e.g.: https://leetcode.com/problems/generate-parentheses/
3. Select C# as a programming language
![image](https://github.com/user-attachments/assets/1cdcd69d-3ae5-40bc-adb1-44bf54e95e43)

4. Press ALT + SHIFT + F to format the C# code

